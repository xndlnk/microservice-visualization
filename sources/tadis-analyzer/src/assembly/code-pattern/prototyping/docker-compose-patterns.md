- allow node pattern to match yaml path, e.g. 'services\.(.+)'
- allow matched yaml elements children to be SearchTextLocation where search for target node continues
- in general, allow a node pattern to continue search at another source file using the information extracted by the current pattern
- node pattern types:
  - regexp path
  - regexp content
  - yaml content

## yaml to analyze

```yaml
services:
  tadis-ui:
    build: ../tadis-ui
    ports:
      - "8080:8080"
    environment:
      PORT: "8080"
      SYSTEM_PROVIDER_URL: "http://localhost:8081/collect/system?version=1"

  customized-analyzer:
    build: .
    ports:
      - "8081:8081"
    environment:
      PORT: "8081"
```

## source pattern description

```yaml
edges:
  - type: "SyncDataFlow"
    sourceNodePath:
      # search for file
      - searchLocation: "FILE_PATH"
        regExp: '$sourceRoot.+/docker-compose\.yml'
      # in the file iterate over all nodes below "service:"
      - searchLocation: "FILE_CONTENT"
        yaqlExp: '$.service'
      # for each service node
      - searchLocation: "EACH_YAML_NODE"
        nodeType: "MicroService"
        # extract node name from service node itself
        # (don't really know if this correct in yaql)
        nodeName:
          yaqlExp: '$'
        # extract and save target id which will be used as a reference id to this node
        targetId:
          yaqlExp: '$.environment.PORT'
    # for each of many source nodes, try to match a target node
    targetNodePath:
      # search in the currently active file
      - searchLocation: "SAME_FILE_CONTENT"
        yaqlExp: '$.service'
      - searchLocation: "EACH_YAML_NODE"
        nodeType: "MicroService"
        nodeName:
          yaqlExp: '$'
        # match the regular expression.
        # target node will only be created on success.
        match:
          regExp: 'http://localhost:$targetId/'
```