## Patrick Oliveira Lemes - GRR20211777
## Sabry Inacio Rafrafi - GRR20171622

import socket
import json
import Blockchain

def handleRequest(data):
    response = {}

    if not 'owner_name' in data or not 'amount' in data:
        response['status'] = "erro"
        response['tipo'] = "requisiçao nao contem owner ou quantia"
    elif not type(data['amount']) is int:
        response['status'] = "erro"
        response['tipo'] = "valor de quantia nao eh um inteiro"
    else:
        response['status'] = "pendente" # ainda precisa verificar se a transaçao eh valida

    return response

def server(host = 'localhost', port=8082):
    print("=============================================================================")
    print("Iniciando servidor do Block Chain")
    print("=============================================================================")
    # criar block chain inicial
    print("Criando genesis...")
    blockchain = Blockchain.BlockChain()
    print("Genesis criado com sucesso!")

    blockchain.print_chain()
    # The maximum amount of data to be received at once
    data_payload = 2048
    # Create a TCP socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # Enable reuse address/port
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    # Bind the socket to the port
    server_address = (host, port)
    print("Servidor iniciado no host: %s port: %s \n\n" % server_address)
    sock.bind(server_address)
    # Listen to clients, argument specifies the max no. of queued connections
    sock.listen(5)

    client, address = sock.accept()

    while True:
        print ("Esperando para receber a mensagem do cliente...")

        json_data = client.recv(data_payload)

        if json_data:
            data = json_data.decode('utf-8')
            data = json.loads(data)

            print ("Mensagem recebida, Dados: %s" % data)
            print("Processando mensagem....")
            if not 'exit' in data:
                response = handleRequest(data)

                if response['status'] == "pendente":
                    if blockchain.add_block_to_end(data['owner_name'], data['amount'], 0):
                        print("transação VALIDA, novo bloco inserido na BlockChain")
                        blockchain.print_chain()
                        response['status'] = "sucesso"
                    else:
                        response['status'] = "erro"
                        response['tipo'] = "saldo insuficiente"
                        print("transação INVALIDA: saldo insuficiente")
                    response['owner_name'] = data['owner_name']
                    response['saldo'] = blockchain.get_balance(data['owner_name'])
                elif 'owner_name' in data:
                    response['owner_name'] = data['owner_name']
                    response['saldo'] = blockchain.get_balance(data['owner_name'])
                print ("Enviando resposta %s para %s" % (response, address))

                json_response = json.dumps(response)

                # eviar resposta
                client.sendall(json_response.encode('utf-8'))
                print("Fim da transação")
                print("============================\n\n")
            else:
                print("\nFechando conexão...")
                # end connection
                client.close()
                break

server()