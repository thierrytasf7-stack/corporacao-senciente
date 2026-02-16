class Entity:
    """A basic entity in the chaos world"""

    def __init__(self, name, entity_type="generic"):
        self.name = name
        self.entity_type = entity_type
        self.id = id(self)  # Unique identifier
        self.position = (0, 0)  # Default position

    def get_info(self):
        return f"{self.entity_type} '{self.name}' at {self.position}"


class ChaosWorld:
    """A basic chaos world simulation class"""

    def __init__(self, size):
        self.size = size
        self.world_state = f"Chaos World of size {size}"
        self.entities = []  # List to store entities in the world

    def add_entity(self, entity):
        """Add an entity to the chaos world"""
        if len(self.entities) < self.size:
            self.entities.append(entity)
            print(f"Entity '{entity.name}' added to chaos world")
            return True
        else:
            print(f"Cannot add entity '{entity.name}': World is at maximum capacity ({self.size})")
            return False

    def get_world_info(self):
        return self.world_state

def main():
    # Initialize chaos world
    chaos = ChaosWorld(10)
    print("Chaos Initialized")
    print(f"World Info: {chaos.get_world_info()}")

    # Create and add entities
    entity1 = Entity("Chaos Agent", "agent")
    entity2 = Entity("Void Creature", "creature")

    chaos.add_entity(entity1)
    chaos.add_entity(entity2)

if __name__ == "__main__":
    main()
