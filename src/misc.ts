export function chain<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  let prev: Promise<any> | undefined;
  return function _fn(...args) {
    const curr = (prev || Promise.resolve())
      .then(() => fn(...args))
      .then((result) => {
        if (prev === curr) prev = undefined;
        return result;
      });
    return (prev = curr);
  } as T;
}

interface QueueNode<T> {
  value: T;
  next: QueueNode<T> | undefined;
}

class Queue<T> {
  #source: AsyncIterator<T>;
  tail: QueueNode<T>;
  head: QueueNode<T>;

  done: boolean;

  constructor(iterable: AsyncIterable<T>) {
    this.#source = iterable[Symbol.asyncIterator]();
    this.tail = {
      value: undefined!,
      next: undefined,
    };
    this.head = this.tail;
    this.done = false;
  }

  async next(): Promise<void> {
    const result = await this.#source.next();
    if (!result.done) {
      const nextNode: QueueNode<T> = {
        value: result.value,
        next: undefined,
      };
      this.tail.next = nextNode;
      this.tail = nextNode;
    } else {
      this.done = true;
    }
  }
}

interface Branched<T> {
  get: () => AsyncGenerator<T>;
}

export function branch<T>(
  iterable: AsyncIterable<T>,
): Branched<T> {
  const queue = new Queue<T>(iterable);
  const tail: QueueNode<T> = queue.head === queue.tail ? queue.tail : {
    value: undefined!,
    next: queue.tail,
  };
  return {
    get: async function* () {
      let buffer = tail;
      while (true) {
        if (buffer.next) {
          buffer = buffer.next;
          yield buffer.value;
        } else if (queue.done) {
          return;
        } else {
          await queue.next();
        }
      }
    },
  };
}
