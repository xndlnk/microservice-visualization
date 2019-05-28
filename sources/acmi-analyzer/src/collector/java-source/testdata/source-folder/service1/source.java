@Service
@Slf4j
public class EventService {

    private static final String TARGET_EXCHANGE_NAME = "target-exchange";

    private static final String TARGET_EXCHANGE_ROUTING_KEY = "t.publish.update";

    @Autowired
    @Qualifier("rabbitTemplateSendToDQ")
    private RabbitTemplate rabbitTemplateSendToDQ;


    @EventProcessor(
            receiveFromExchange = "source-exchange",
            receiveFromRoutingKey = "s.publish.update",
            receiveFromQueue = "service1.s.publish.update",
            sendToExchange = TARGET_EXCHANGE_NAME,
            sendToRoutingKey = TARGET_EXCHANGE_ROUTING_KEY,
            autoSave = false)
    public Container receiveX(X x) {
    }
}