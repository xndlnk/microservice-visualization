@Startup
@Singleton
public class SomeKafkaProducer extends AbstractKafkaProducer {

    @Inject
    @ConfigProperty(name = "SOME_KAFKA_TOPIC")
    protected String kafkaTopic;

    @Inject
    @ConfigProperty(name = "SOME_KAFKA_TOPIC")
    protected String kafkaTopic;

}