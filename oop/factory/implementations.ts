import { Factory, Item, Machine, Part, Person } from "./interfaces";

export type PartNameCollection = Record<Part["name"], number>;
export type UsePartResult =
    | {
          success: true;
      }
    | {
          success: false;
          missing_parts: PartNameCollection;
      };

export function part_name_collection_to_string(part_name_collection: PartNameCollection): string {
    return Object.entries(part_name_collection)
        .map(([name, quantity]) => `${quantity}x ${name}`)
        .join(", ");
}

export function try_to_use_parts(
    parts: Part[],
    required_part_names: PartNameCollection
): UsePartResult {
    const used_parts: Part[] = [];

    const part_names = Object.keys(required_part_names);
    let success = true;

    for (let i = 0; i < part_names.length; i++) {
        while (required_part_names[part_names[i]] > 0) {
            const result = parts.findIndex((part) => part.name == part_names[i]);

            if (result == -1) {
                success = false;
                break;
            }

            required_part_names[part_names[i]] -= 1;
            used_parts.push(...parts.splice(result, 1));
        }

        if (required_part_names[part_names[i]] == 0) {
            delete required_part_names[part_names[i]];
        }
    }

    if (!success) {
        parts.push(...used_parts);
        return {
            success: false,
            missing_parts: required_part_names,
        };
    }

    return { success: true };
}

export class Operator implements Person {
    name: string;

    public constructor(name: string) {
        this.name = name;
    }

    public interact(item: Item): boolean {
        return item.use();
    }
}

// There is a subtle difference in `readonly name: string = 'Text'` and
// `readonly name = 'Text'` and that is that the latter is a literal instead
// of a string. This means that an instance or child class of IronPlate can
// only have the name 'Iron Plate' otherwise it would violate the type contract.
// This means that if a machine requires IronPlate it can only accept IronPlate or
// equal classes.
export class IronPlate implements Part {
    public readonly description = "A plate of iron";
    public readonly name = "Iron Plate";
}

export class IronGearWheel implements Part {
    public readonly description = "A gear made out of iron";
    public readonly name = "Iron Gear Wheel";
}

export class SteelPlate implements Part {
    public readonly description = "A plate of steel";
    public readonly name = "Steel Plate";
}

export class Pipe implements Part {
    public readonly description = "A pipe made out of iron";
    public readonly name = "Pipe";
}

export class Engine implements Item {
    public parts: Part[] = [];
    public complete: boolean = false;

    public use(): boolean {
        return this.complete;
    }
}

export class IronGearWheelPress implements Machine {
    public parts: Part[];
    private operator?: Operator;

    public constructor(parts: Part[]) {
        this.parts = parts;
    }

    public occupy(operator: Operator): boolean {
        if (this.operator != null) return false;

        this.operator = operator;
        return true;
    }

    public assemble(item: Item): boolean {
        if (this.operator == null) {
            console.log("IronGearWheelPress missing operator");
            return false;
        }

        const result = try_to_use_parts(this.parts, { "Iron Plate": 2 });
        if (!result.success) {
            console.log(
                `${
                    this.operator.name
                } reported IronGearWheelPress missing parts: ${part_name_collection_to_string(
                    result.missing_parts
                )}`
            );
            return false;
        }

        item.parts.push(new IronGearWheel());
        return true;
    }
}

export class PipeMaker implements Machine {
    public parts: Part[];
    private operator?: Operator;

    public constructor(parts: Part[]) {
        this.parts = parts;
    }

    public occupy(operator: Operator): boolean {
        if (this.operator != null) return false;

        this.operator = operator;
        return true;
    }

    public assemble(item: Item): boolean {
        if (this.operator == null) {
            console.log("PipeMaker missing operator");
            return false;
        }

        const result = try_to_use_parts(this.parts, { "Iron Plate": 1 });
        if (!result.success) {
            console.log(
                `${
                    this.operator.name
                } reported PipeMaker missing parts: ${part_name_collection_to_string(
                    result.missing_parts
                )}`
            );
            return false;
        }

        item.parts.push(new Pipe());
        return true;
    }
}

export class SteelWelder implements Machine {
    public parts: Part[];
    private operator?: Operator;

    public constructor(parts: Part[]) {
        this.parts = parts;
    }

    public occupy(operator: Operator): boolean {
        if (this.operator != null) return false;

        this.operator = operator;
        return true;
    }

    public assemble(item: Item): boolean {
        if (this.operator == null) {
            console.log("PipeMaker missing operator");
            return false;
        }

        const result = try_to_use_parts(this.parts, { "Steel Plate": 1 });
        if (!result.success) {
            console.log(
                `${
                    this.operator.name
                } reported PipeMaker missing parts: ${part_name_collection_to_string(
                    result.missing_parts
                )}`
            );
            return false;
        }

        item.parts.push(new SteelPlate());
        return true;
    }
}

export class EngineAssembler implements Machine {
    public parts: Part[];
    private operator?: Operator;

    public constructor(parts: Part[]) {
        this.parts = parts;
    }

    public occupy(operator: Operator): boolean {
        if (this.operator != null) return false;

        this.operator = operator;
        return true;
    }

    public assemble(item: Engine): boolean {
        if (this.operator == null) {
            console.log("EngineAssembler missing operator");
            return false;
        }

        const result = try_to_use_parts(item.parts, {
            "Steel Plate": 1,
            "Iron Gear Wheel": 1,
            Pipe: 2,
        });
        if (!result.success) {
            console.log(
                `${
                    this.operator.name
                } reported EngineAssembler missing parts: ${part_name_collection_to_string(
                    result.missing_parts
                )}`
            );
            return false;
        }

        return true;
    }
}

export class EngineFactory implements Factory {
    public readonly assembly: Machine[];
    private parts: Part[] = [];

    public constructor() {
        this.assembly = [
            new IronGearWheelPress(this.parts),
            new PipeMaker(this.parts),
            new PipeMaker(this.parts),
            new SteelWelder(this.parts),
            new EngineAssembler(this.parts),
        ];

        this.assembly.forEach((machine, index) =>
            machine.occupy(new Operator(`Operator ${index + 1}`))
        );
    }

    public add_part(...part: Part[]) {
        this.parts.push(...part);
    }

    public produce(): Engine {
        const engine = new Engine();

        for (let i = 0; i < this.assembly.length; i++) {
            if (!this.assembly[i].assemble(engine)) {
                return engine;
            }
        }

        engine.complete = true;
        return engine;
    }
}
