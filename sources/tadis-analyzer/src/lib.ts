// don't use typescript path alias here. imported types won't be available
// in other typescript projects which depend on this one.
// it's ok to use path alias in tests.

import * as core from './model/core'
import * as ms from './model/ms'
import * as transport from './model/transport'
export { ms, core, transport }

export * from './model/core'
export * from './model/ms'

export * from './config/Config.module'
export * from './git/Git.module'

export * from './system-element-extractors/java/Java.module'
export * from './system-element-extractors/env-variables/EnvVariables.module'
export * from './system-element-extractors/kubernetes/Kubernetes.module'
export * from './system-element-extractors/rabbitmq/RabbitMq.module'
export * from './system-element-extractors/spring-boot/SpringBoot.module'

export * from './system-assemblers/controllers/SystemAssembler.module'
export * from './system-assemblers/kubernetes-rabbitmq/KubernetesRabbitMqAssembler.module'

export * from './post-processors/PostProcessors.module'

import * as fileAnalysis from './utils/files/analysis'
export { fileAnalysis }

// deprecated exports
export * from './deprecated-modules/SourceCodeAnalysis.module'
export * from './deprecated-modules/CommonTransformers.module'
export * from './deprecated-modules/Msa.module'
