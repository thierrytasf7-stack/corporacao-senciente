class VoidMessenger:
    """A messenger class that sends messages to void"""

    def __init__(self):
        self.messages_sent = 0

    def send_message(self, message):
        """Send a message to void"""
        print(f"Sending message to void: {message}")
        self.messages_sent += 1

    def get_message_count(self):
        """Get the total number of messages sent"""
        return self.messages_sent


class Mind:
    """A mind class that stores cognitive state and decision history"""

    def __init__(self):
        self.thoughts = []
        self.decisions = []
        self.emotional_state = "neutral"
        self.knowledge_base = {}

    def add_thought(self, thought):
        """Add a thought to the mind's memory"""
        self.thoughts.append({
            'content': thought,
            'timestamp': len(self.thoughts) + 1
        })
        print(f"Mind processing: {thought}")

    def make_decision(self, decision, reason):
        """Record a decision with reasoning"""
        decision_record = {
            'decision': decision,
            'reason': reason,
            'timestamp': len(self.decisions) + 1
        }
        self.decisions.append(decision_record)
        print(f"Decision made: {decision} - Reason: {reason}")
        return decision

    def learn(self, topic, information):
        """Store knowledge in the mind"""
        self.knowledge_base[topic] = information
        print(f"Knowledge acquired: {topic} -> {information}")

    def get_thought_history(self):
        """Get all thoughts stored in the mind"""
        return self.thoughts

    def get_decision_history(self):
        """Get all decisions made by the mind"""
        return self.decisions

    def get_emotional_state(self):
        """Get current emotional state"""
        return self.emotional_state

    def set_emotional_state(self, emotion):
        """Set the emotional state of the mind"""
        self.emotional_state = emotion
        print(f"Emotional state changed to: {emotion}")


def main():
    # Initialize components
    messenger = VoidMessenger()
    mind = Mind()

    # Mind initialization and learning
    mind.add_thought("System initialization beginning")
    mind.learn("autonomy", "The capacity to make independent decisions")
    mind.set_emotional_state("curious")

    # Make autonomous decisions
    decision1 = mind.make_decision("Send greeting message", "Establish communication protocol")
    messenger.send_message("Hello, Autonomy!")

    decision2 = mind.make_decision("Report system status", "Provide operational feedback")
    messenger.send_message("System initialized.")
    mind.add_thought("Communication established successfully")

    # Report statistics
    print(f"Total messages sent: {messenger.get_message_count()}")
    print(f"Total thoughts processed: {len(mind.get_thought_history())}")
    print(f"Total decisions made: {len(mind.get_decision_history())}")
    print(f"Current emotional state: {mind.get_emotional_state()}")

if __name__ == "__main__":
    main()
