import { INode } from '../domain/model'

export const system: INode = {
  id: 'simple',
  name: 'simple',
  type: 'System',
  nodes: [
    { id: 'source1', name: 'source1', type: 'Microservice' },
    { id: 'source2', name: 'source2', type: 'Microservice' },
    { id: 'sink1', name: 'sink1', type: 'Microservice' },
    { id: 'sink2', name: 'sink2', type: 'Microservice' },
    {
      id: 'subsystem1',
      name: 'subsystem1',
      type: 'System',
      nodes: [
        { id: 'a', name: 'a', type: 'Microservice' },
        { id: 'c', name: 'c', type: 'Microservice' }
      ],
      edges: [
        {
          sourceId: 'c',
          targetId: 'a',
          type: 'AsyncInfoFlow'
        }
      ]
    },
    { id: 'b', name: 'b', type: 'Microservice' },
    { id: 'd', name: 'd', type: 'Microservice' }
  ],
  edges: [
    {
      sourceId: 'source1',
      targetId: 'c',
      type: 'AsyncInfoFlow'
    },
    {
      sourceId: 'c',
      targetId: 'd',
      type: 'AsyncInfoFlow'
    },
    {
      sourceId: 'source2',
      targetId: 'c',
      type: 'AsyncInfoFlow'
    },
    {
      sourceId: 'source2',
      targetId: 'd',
      type: 'AsyncInfoFlow'
    },
    {
      sourceId: 'd',
      targetId: 'b',
      type: 'AsyncInfoFlow'
    },
    {
      sourceId: 'a',
      targetId: 'sink1',
      type: 'AsyncInfoFlow'
    },
    {
      sourceId: 'b',
      targetId: 'sink1',
      type: 'AsyncInfoFlow'
    },
    {
      sourceId: 'b',
      targetId: 'sink2',
      type: 'AsyncInfoFlow'
    }
  ]
}
