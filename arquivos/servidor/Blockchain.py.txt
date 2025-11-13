## Patrick Oliveira Lemes - GRR20211777
## Sabry Inacio Rafrafi - GRR20171622

import Block

class BlockChain:

    def __init__(self):
        self.head = self.create_genesis_block()
        self.tail = self.head

    def create_genesis_block(self):
        # primeiras 100 moedas do miniCoin, poggers
        return Block.Block(owner_name = "genesis", amount = 100,previous_hash = "0",nonce = 0)

    def get_last_block(self):
        return self.tail

    def add_block_to_end(self, owner_name, amount, nonce):
        if(amount < 0):
            current_balance = self.get_balance(owner_name)
            if current_balance + amount < 0:
                print("Saldo insuficiente")
                return False

        previous_block = self.tail
        new_block = Block.Block(owner_name, amount, previous_block.hash, nonce)
        previous_block.next = new_block
        self.tail = new_block
        return True

    def get_balance(self, owner_name):
        # varre a block chain e retorna o saldo do owner
        balance = 0
        aux = self.head

        while aux is not None:
            if aux.owner_name == owner_name:
                balance += aux.amount

            aux = aux.next

        return balance

    def print_chain(self):
        print("\n======================")
        print("Blockchain completa:")
        print("======================")
        aux = self.head
        count = 0

        while aux is not None:
            print(f"\nBloco {count}:")
            print(f"Owner:    {aux.owner_name}")
            print(f"Amount:   {aux.amount}")
            print(f"Nonce:    {aux.nonce}")
            print(f"Hash:     {aux.hash}")
            print(f"Prev. Hash: {aux.previous_hash}")

            if aux.next is not None:
                print("|")
                print("v")

            aux = aux.next
            count += 1
        print("======================")