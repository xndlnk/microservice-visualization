# TADIS - Tool for Architecture Discovery

- [tadis-analyzer](sources/tadis-analyzer) - analyzer backend
- [tadis-analyzer-custom-example](sources/tadis-analyzer-custom-example) - example customization of tadis-analyzer
- [tadis-viewer-d3](sources/tadis-viewer-d3) - web-frontend based on D3


## Analyzer Modules

### Sub-System Transformer

Use this transformer when you have a flat system where some nodes have a payload defining their association to a sub-system and you want the system to be transformed to a system of sub-systems. This transformer creates new sub-system nodes and moves each node to its sub-system node.

[See code in SubSystemTransformer.ts](sources/tadis-analyzer/src/msa/common/SubSystemTransformer.ts)
