import test from 'node:test';
import assert from 'node:assert/strict';
import { articles, getArticle } from '../src/data/articles.js';

test('static demo articles define unique slugs and explicit non-reviewed status', () => {
  assert.ok(articles.length >= 3, 'Must have at least 3 static articles');
  const slugs = new Set();
  for (const a of articles) {
    assert.ok(a.slug && !slugs.has(a.slug), `Duplicate or missing slug: ${a.slug}`);
    slugs.add(a.slug);
    assert.ok(a.title, 'Title required');
    assert.ok(a.summary, 'Summary required');
    assert.ok(a.content, 'Content required');
    assert.ok(a.source, 'Source must be documented');
    assert.equal(a.reviewedAt, null, 'Demo content must explicitly mark reviewedAt as null');
  }
});

test('getArticle returns matching article or undefined', () => {
  const first = articles[0];
  assert.equal(getArticle(first.slug)?.title, first.title);
  assert.equal(getArticle('non-existent-slug'), undefined);
});
