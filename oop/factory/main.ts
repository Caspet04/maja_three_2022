import { Operator, EngineFactory, IronPlate, SteelPlate } from "./implementations";
// run program using following command:
// npm install
// npm run dev

const factory = new EngineFactory();

const student: Operator = new Operator("Chad Chaddington");

factory.add_part(
    ...[new IronPlate(), new IronPlate(), new IronPlate(), new SteelPlate(), new IronPlate()]
);
const item = factory.produce();

const success = student.interact(item);

console.log(success ? "item works!" : "item worksn't");
