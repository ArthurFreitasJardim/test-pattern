export class UserMother {
  static regular() {
    return {
      name: 'João',
      email: 'joao@email.com',
      isPremium: () => false
    };
  }

  static premium() {
    return {
      name: 'Maria',
      email: 'maria@email.com',
      isPremium: () => true
    };
  }
}