export type Tag<TagName extends string> = { __tag: TagName };

export type Message = {
    content: string;
};
