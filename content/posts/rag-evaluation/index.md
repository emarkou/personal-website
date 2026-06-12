---
title: How I Evaluate RAG Pipelines in Production
description: A practical guide to measuring retrieval quality, answer faithfulness, and end-to-end performance in RAG systems.
date: '2025-03-15'
draft: false
slug: '/blog/rag-evaluation'
tags:
  - ML
  - RAG
  - LLMs
  - Evaluation
---

Building a RAG (Retrieval-Augmented Generation) system is the easy part. Knowing whether it's actually working well in production is the hard part.

Over the past year I've shipped several RAG systems — for internal knowledge search, customer support, and document Q&A — and evaluation has been the most underrated challenge in each of them. This is what I've learned.

## Why standard metrics fail

The temptation is to use ROUGE or BLEU scores. Don't. They measure lexical overlap against reference answers, which punishes paraphrasing and rewards verbosity. A model that repeats the question back to you scores surprisingly well.

Perplexity is equally useless for RAG — it tells you about the language model's confidence, not whether it retrieved the right context or answered faithfully.

What you actually care about is a set of orthogonal properties:

1. **Retrieval quality** — did the retriever find the relevant chunks?
2. **Answer faithfulness** — does the answer actually follow from the retrieved context?
3. **Answer relevance** — does the answer address the question asked?
4. **Groundedness** — is every claim in the answer traceable to a source?

## Retrieval metrics

For retrieval, I use offline and online signals together.

**Offline:** build a test set of (query, relevant_doc_ids) pairs. Then measure:

- **Recall@k** — what fraction of relevant docs appear in the top-k results?
- **MRR (Mean Reciprocal Rank)** — where does the first relevant result appear?
- **nDCG@k** — weighted recall that penalises relevant results ranked lower

Getting ground-truth labels is the bottleneck. Approaches that work: mine from user clicks on a search interface, use an LLM to generate synthetic QA pairs from your corpus, or manually annotate a small set and bootstrap with weak supervision.

**Online:** if users can give thumbs up/down on answers, click through to sources, or reformulate queries, all of those are retrieval quality signals. Track them.

## Faithfulness with LLM judges

For faithfulness, I've converged on using an LLM-as-judge approach. The prompt is roughly:

```
Given the following context:
{context}

And the following answer:
{answer}

For each sentence in the answer, determine whether it is supported by, contradicted by, or not mentioned in the context. Return a JSON list.
```

Calculate a faithfulness score as `supported_sentences / total_sentences`. Anything below ~0.85 is a sign the model is hallucinating.

The obvious concern here is that you're using an LLM to evaluate an LLM. In practice, GPT-4 or Claude Sonnet is a reliable faithfulness judge — the hallucination cases they miss tend to be subtle, and the obvious failures they catch consistently. Use a stronger model than the one in your pipeline for judging.

## The RAGAS framework

[RAGAS](https://docs.ragas.io/) automates most of this. It computes:

- **Faithfulness** — via the sentence-entailment approach above
- **Answer relevancy** — by generating hypothetical questions from the answer and measuring cosine similarity to the original question
- **Context precision** — are the retrieved chunks relevant to the question?
- **Context recall** — are all the relevant facts from ground truth present in the context?

I'd recommend running RAGAS on a representative sample (500–1000 examples) whenever you change retrieval strategy, chunking logic, or the generation prompt. Treat it like a test suite.

## What to monitor in production

Offline evals tell you about regression. Online monitoring tells you about drift.

Metrics I track in Grafana for every RAG endpoint:

- **Retrieval latency p50/p99** — chunk retrieval time separately from LLM time
- **Answer length distribution** — sudden drops often mean context window issues
- **Faithfulness score (sampled)** — run the judge asynchronously on ~5% of live traffic
- **User feedback rate** — explicit signals where available
- **Query embedding drift** — are users asking different kinds of questions than you tested?

For the embedding drift, I compute PCA on daily query batches and alert when the centroid shifts more than a threshold from the baseline. This has caught two silent failures in production for me.

## A note on chunking

The eval loop will quickly surface bad chunking. Common failure modes:

- **Chunks too small** → context window has plenty of space but retrieved chunks don't have enough information to answer
- **Chunks too large** → retrieved chunks contain the answer but also a lot of noise, hurting faithfulness
- **Sentence-level splits across topics** → a chunk that starts talking about A and ends talking about B confuses both retrieval and generation

I've found recursive character splitting with ~512 token chunks and ~50 token overlap works well as a starting point for most corpora, with adjustments after examining failing cases.

---

Evaluation is not a one-time thing. Treat it as infrastructure: automate it, run it continuously, and let it guide every architectural decision. The teams I've seen ship reliable RAG systems all treat eval with the same seriousness as test coverage.
