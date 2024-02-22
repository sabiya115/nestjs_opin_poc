import { Module } from "@nestjs/common";
import {ObjectModule} from "./object/object.module"

@Module({
    imports:[
        ObjectModule,
    ]
})
export class RestModule {}