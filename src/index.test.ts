import {sayHello} from './index';

describe('sayHello', () => {
  it('says hello', () => {
    expect(sayHello('logan')).toEqual('hello logan!');
  });
});
