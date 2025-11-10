import { jest } from '@jest/globals';
import { CheckoutService } from '../src/services/CheckoutService.js';
import { CarrinhoBuilder } from '../test-builders/CarrinhoBuilder.js';
import { UserMother } from '../test-builders/UserMother.js';

describe('CheckoutService', () => {
    let gatewayStub;
    let repoStub;
    let emailMock;
    let checkoutService;

    beforeEach(() => {
        gatewayStub = { cobrar: jest.fn() };
        repoStub = { salvar: jest.fn() };
        emailMock = { enviarEmail: jest.fn() };

        checkoutService = new CheckoutService(gatewayStub, repoStub, emailMock);
    });

    describe('quando o pagamento falha', () => {
        it('deve retornar null e não chamar repositório nem email', async () => {
            const user = UserMother.regular();
            const carrinho = new CarrinhoBuilder()
                .comUsuario(user)
                .comItem('Fone', 200)
                .build();

            gatewayStub.cobrar.mockResolvedValue({ success: false });

            const pedido = await checkoutService.processarPedido(carrinho, '9999');

            expect(pedido).toBeNull();
            expect(repoStub.salvar).not.toHaveBeenCalled();
            expect(emailMock.enviarEmail).not.toHaveBeenCalled();
        });
    });

    describe('quando um cliente Premium finaliza a compra', () => {
        it('deve aplicar desconto de 10% e enviar e-mail de confirmação', async () => {
            const user = UserMother.premium();
            user.email = 'premium@email.com';

            const carrinho = new CarrinhoBuilder()
                .comUsuario(user)
                .comItem('Mouse', 100)
                .comItem('Teclado', 100)
                .build();

            gatewayStub.cobrar.mockResolvedValue({ success: true });
            repoStub.salvar.mockResolvedValue({ id: 42 });
            emailMock.enviarEmail.mockResolvedValue(true);

            const pedido = await checkoutService.processarPedido(carrinho, '1234-5678');

            expect(gatewayStub.cobrar).toHaveBeenCalledWith(180, '1234-5678');
            expect(repoStub.salvar).toHaveBeenCalledTimes(1);
            expect(emailMock.enviarEmail).toHaveBeenCalledTimes(1);
            expect(emailMock.enviarEmail).toHaveBeenCalledWith(
                'premium@email.com',
                'Seu Pedido foi Aprovado!',
                expect.stringContaining('R$180')
            );

            expect(pedido).toEqual({ id: 42 });
        });
    });
});
