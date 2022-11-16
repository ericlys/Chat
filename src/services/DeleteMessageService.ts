import { injectable } from "tsyringe";
import { Message } from "../schemas/Message";

@injectable()
class DeleteMessageService {
  async execute(id: string){
    await Message.deleteOne({"_id": id})
  }
}

export { DeleteMessageService }