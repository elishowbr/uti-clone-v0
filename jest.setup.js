// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'node:util';

// Adiciona as globais necessárias para o Prisma funcionar no ambiente de teste
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
