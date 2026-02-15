import { Attribution } from 'ox/erc8021';
import {
  Signer,
  TransactionRequest,
  TransactionResponse,
  Provider,
  BlockTag,
  TransactionLike,
} from 'ethers';

// Builder Code from base.dev - bc_ec2dy6ac
const BUILDER_CODE = 'bc_ec2dy6ac';

// Generate the data suffix for attribution
export const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: [BUILDER_CODE],
});

/**
 * Custom signer that appends builder code attribution to all transactions
 */
class AttributedSigner implements Signer {
  readonly #signer: Signer;

  constructor(signer: Signer) {
    this.#signer = signer;
  }

  get provider(): null | Provider {
    return this.#signer.provider;
  }

  async getAddress(): Promise<string> {
    return this.#signer.getAddress();
  }

  async getNonce(blockTag?: BlockTag): Promise<number> {
    return this.#signer.getNonce(blockTag);
  }

  async populateCall(tx: TransactionRequest): Promise<TransactionLike<string>> {
    return this.#signer.populateCall(tx);
  }

  async populateTransaction(tx: TransactionRequest): Promise<TransactionLike<string>> {
    const populated = await this.#signer.populateTransaction(tx);
    // Append builder code suffix to transaction data
    const data = populated.data || '0x';
    return {
      ...populated,
      data: data + DATA_SUFFIX.slice(2), // Remove '0x' prefix from suffix
    };
  }

  async estimateGas(tx: TransactionRequest): Promise<bigint> {
    return this.#signer.estimateGas(tx);
  }

  async call(tx: TransactionRequest): Promise<string> {
    return this.#signer.call(tx);
  }

  async resolveName(name: string): Promise<null | string> {
    return this.#signer.resolveName(name);
  }

  async signTransaction(tx: TransactionRequest): Promise<string> {
    const populated = await this.populateTransaction(tx);
    return this.#signer.signTransaction(populated);
  }

  async sendTransaction(tx: TransactionRequest): Promise<TransactionResponse> {
    const populated = await this.populateTransaction(tx);
    return this.#signer.sendTransaction(populated);
  }

  async signMessage(message: string | Uint8Array): Promise<string> {
    return this.#signer.signMessage(message);
  }

  async signTypedData(domain: any, types: any, value: any): Promise<string> {
    return this.#signer.signTypedData(domain, types, value);
  }

  async populateAuthorization(auth: any): Promise<any> {
    if ('populateAuthorization' in this.#signer && typeof this.#signer.populateAuthorization === 'function') {
      return this.#signer.populateAuthorization(auth);
    }
    throw new Error('populateAuthorization not supported by underlying signer');
  }

  async authorize(auth: any): Promise<any> {
    if ('authorize' in this.#signer && typeof this.#signer.authorize === 'function') {
      return this.#signer.authorize(auth);
    }
    throw new Error('authorize not supported by underlying signer');
  }

  connect(provider: null | Provider): Signer {
    return new AttributedSigner(this.#signer.connect(provider));
  }
}

/**
 * Wraps a signer to add builder code attribution to all transactions
 */
export function wrapSignerWithAttribution(signer: Signer): Signer {
  return new AttributedSigner(signer);
}

/**
 * Get the builder code data suffix as hex string
 */
export function getBuilderCodeSuffix(): string {
  return DATA_SUFFIX;
}
