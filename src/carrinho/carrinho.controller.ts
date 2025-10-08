import { Request, Response } from "express";
//import aqui as dependências necessárias
import { ObjectId } from "bson";
import { db } from "../database/banco-mongo.js";

interface ItemCarrinho {
    produtoId: string;
    quantidade: number;
    precoUnitario: number;
    nome: string;
}

interface Carrinho {
    usuarioId: string;
    itens: ItemCarrinho[];
    dataAtualizacao: Date;
    total: number;
}
class CarrinhoController {
    //adicionarItem
    async adicionarItem(req: Request, res: Response) {
        console.log("Chegou na rota de adicionar item ao carrinho");
        const { usuarioId, produtoId, quantidade } = req.body;
        // Buscar o produto no banco de dados
        const produto = await db.collection("produtos").findOne({ _id: ObjectId.createFromHexString(produtoId) });
        if (!produto) {
            return res.status(400).json({ message: "Produto não encontrado" });
        }
        const precoUnitario = produto.preco;
        const nome = produto.nome;

        // Verificar se já existe carrinho para o usuário
        let carrinho = await db.collection("carrinhos").findOne({ usuarioId });
        const novoItem: ItemCarrinho = {
            produtoId,
            quantidade,
            precoUnitario,
            nome
        };
        if (!carrinho) {
            // Criar novo carrinho
            const novoCarrinho = {
                usuarioId,
                itens: [novoItem],
                dataAtualizacao: new Date(),
                total: precoUnitario * quantidade
            };
            await db.collection("carrinhos").insertOne(novoCarrinho);
        } else {
            // Verifica se o produto já está no carrinho
            const index = carrinho.itens.findIndex((item: ItemCarrinho) => item.produtoId === produtoId);
            if (index > -1) {
                // Atualiza a quantidade do item existente
                carrinho.itens[index].quantidade += quantidade;
            } else {
                // Adiciona novo item
                carrinho.itens.push(novoItem);
            }
            // Recalcula o total
            carrinho.total = carrinho.itens.reduce((acc: number, item: ItemCarrinho) => acc + item.precoUnitario * item.quantidade, 0);
            carrinho.dataAtualizacao = new Date();
            await db.collection("carrinhos").updateOne(
                { usuarioId },
                { $set: { itens: carrinho.itens, total: carrinho.total, dataAtualizacao: carrinho.dataAtualizacao } }
            );
        }
        res.status(200).json({ message: "Item adicionado ao carrinho com sucesso" });

    }
    removerItem(req: import('express').Request, res: import('express').Response) {
        // Implemente a lógica para remover um item do carrinho aqui
        res.status(200).json({ message: 'Item removido do carrinho.' });
    }
    listar(req: Request, res: Response) {
        // implementação
    }

    remover(req: Request, res: Response) {
        // Implemente a lógica para remover o carrinho do usuário
        const { usuarioId } = req.params;
        // Exemplo de resposta
        res.status(200).json({ message: `Carrinho do usuário ${usuarioId} removido com sucesso.` });
    }








    //removerItem
    //atualizarQuantidade
    //listar
    //remover                -> Remover o carrinho todo

}
export default new CarrinhoController();