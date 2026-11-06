# tinyml-kit (demo repo context for the ask-anything assistant)

## README (excerpt)
tinyml-kit is a small, readable deep-learning toolkit for teaching. Core modules:
- `tinyml/data/loader.py`: DataLoader (batching, shuffling, `collate_fn`, `drop_last`)
- `tinyml/data/collate.py`: default `collate_fn` stacks samples into tensors; pads variable-length sequences when `pad=True`
- `tinyml/train.py`: training loop
- `tinyml/metrics.py`: accuracy, precision/recall, confusion_matrix

## CONTRIBUTING (excerpt)
- Setup: `python -m venv .venv && source .venv/bin/activate && pip install -e ".[dev]"`
- Run tests: `pytest -q`. All PRs need tests for new behavior.
- Style: `ruff check . && ruff format .`
- Comment `/assign` on a `good first issue` to claim it. Unclaimed after 7 days of inactivity.
- Public API changes (anything exported from `tinyml/__init__.py`) need maintainer approval in the issue BEFORE you open a PR.
- Ask questions in Discord #tinyml-help or on the issue. There are no dumb questions.

## Maintainers
maintainer_a (data, docs), maintainer_b (training, optim)
