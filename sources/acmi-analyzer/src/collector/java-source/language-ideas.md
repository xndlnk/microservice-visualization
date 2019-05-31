# Regular Expression-based Analysis Description Language

The AnnotationAnalyzer could be further generalized into a language runtime.
These are some ideas what the concepts of the language would be and how it might be used.

## Generalized description of a language instance

- search for regexp pattern in whole file
- eval-match: for a certain matching group in each match, do one of the following:
  - a) use matching group value as node name
    - create node of specified type
    - connect node with corresponding node of current repository by creating edge with new node as source or target and of specified edge type
    - continue at start or terminate
  - b) use matching group value as payload
    - add payload to certain existing node
    - continue at start or terminate
  - c) search for pattern in i) whole file or ii) matching group value
  and continue at eval-match