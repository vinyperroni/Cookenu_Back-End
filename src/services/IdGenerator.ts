import { v4 } from "uuid";

export class IdGenerator {
  generateId() {
    return v4();
  }
}
