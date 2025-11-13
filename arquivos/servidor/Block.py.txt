## Patrick Oliveira Lemes - GRR20211777
## Sabry Inacio Rafrafi - GRR20171622

import time
import hashlib

class Block:
    def __init__(self, owner_name, amount, previous_hash, nonce):
        self.owner_name = owner_name
        self.amount = amount
        self.timestamp = time.time()
        self.previous_hash = previous_hash
        self.nonce = nonce 
        self.next = None 
        
        self.hash = self.calculate_block_hash()

    def calculate_block_hash(self):
        data = f"{self.owner_name}{self.amount}"
        data_to_hash = f"{self.previous_hash}{self.timestamp}{self.nonce}{data}"
        
        return hashlib.sha256(data_to_hash.encode()).hexdigest()
    
    def __repr__(self):
        return f"Block(owner='{self.owner_name}', hash='{self.hash[:10]}...')"