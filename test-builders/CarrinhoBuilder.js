export class CarrinhoBuilder {
  constructor() {
    this._user = null;
    this._itens = [];
  }


  comUsuario(user) {
    this._user = user;
    return this;
  }

  comItem(nome, preco) {
    this._itens.push({ nome, preco });
    return this;
  }

  build() {
    const itens = this._itens;
    return {
      user: this._user,
      itens,
      calcularTotal() {
        return itens.reduce((acc, i) => acc + i.preco, 0);
      }
    };
  }
}