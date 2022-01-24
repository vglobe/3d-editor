import { Scene, Sound, ISoundOptions } from "babylonjs";
import { createId } from "../utils";

export function CreateSound (name: string, file: string | File, scene: Scene, option: ISoundOptions = {}, onLoaded: (sound: Sound) => {}) {
    const sound = new Sound(createId(name), file, scene, () => onLoaded(sound), option);
    return sound;
}