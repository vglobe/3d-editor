import { TransformNode } from "babylonjs";
import { Topology3D } from "..";
import { setValue } from "./utils/helper";
import { cloneValue, equalsValue, getValueType, TargetType, ValueType } from "./utils/type";

export enum OperateType {
    Update,
    Add,
    Delete,
    Combine,
    Uncombine
}

export interface Record {
    type: OperateType;
    infos?: RecordInfo[];
    combine?: {
        parent: TransformNode,
        children: TransformNode[]
    }[]
}

export interface RecordInfo {
    target: any;
    targetType: TargetType;
    props?: {
        [property: string]: {
            oldValue: any;
            newValue: any;
            oldValueType?: ValueType;
            newValueType?: ValueType;
        }
    };
}

export class UndoRedoManager {
    public root: Topology3D;
    public limitLen: number = 30;
    private list: Record[] = [];
    private index = -1;

    constructor(root: Topology3D, list?: Record[]) {
        this.root = root;
        if (list) {
            this.list = list;
            this.index = this.list.length - 1;
        }
    }

    add(record: Record) {
        const _record: Record = { type: record.type, infos: [], combine: [] };
        if (record.infos?.length) {
            if (record.type === OperateType.Update) {
                record.infos.forEach(info => {
                    const _info: RecordInfo = { target: info.target, targetType: info.targetType };
                    if (info.props) {
                        const properties = Object.keys(info.props);
                        if (properties.length) {
                            properties.forEach(property => {
                                const { oldValue, newValue } = info.props[property];
                                const oldValueType = getValueType(oldValue);
                                const newValueType = getValueType(newValue);
                                const _props = {
                                    oldValue: cloneValue(oldValue, oldValueType),
                                    newValue: cloneValue(newValue, newValueType),
                                    oldValueType: getValueType(oldValue),
                                    newValueType: getValueType(newValue)
                                };
                                const isEquals = equalsValue(_props.oldValue, _props.newValue, _props.oldValueType, _props.newValueType);
                                if (!isEquals) {
                                    if (!_info.props) {
                                        _info.props = {};
                                    }
                                    _info.props[property] = _props;
                                }
                            });
                        }
                    }
                    if (_info.props) {
                        _record.infos.push(_info);
                    }
                });
            } else {
                _record.infos = record.infos;
            }
        }
        if (
            (record.type === OperateType.Combine ||
                record.type === OperateType.Uncombine) &&
            record.combine?.length
        ) {
            _record.combine = record.combine;
        }
        if (!_record.infos?.length && !_record.combine?.length) {
            return false;
        }
        this.list.splice(this.index + 1, this.list.length);
        this.list.push(_record);
        if (this.list.length > this.limitLen) {
            this.list.splice(0, this.list.length - this.limitLen);
        }
        this.index = this.list.length - 1;
        return true;
    }

    current() {
        return this.list[this.index];
    }

    undo() {
        if (!this.undoable()) {
            return false;
        }
        const record = this.current();
        this.execute(record, true);
        this.index--;
        return true;
    }

    redo() {
        if (!this.redoable()) {
            return false;
        }
        this.index++;
        const record = this.current();
        this.execute(record);
        return true;
    }

    undoable() {
        return this.len() && this.index > -1;
    }

    redoable() {
        return this.len() && this.index < this.list.length - 1;
    }

    len() {
        return this.list.length;
    }

    clear() {
        this.list.length = 0;
        this.index = -1;
    }

    all() {
        return this.list;
    }

    log() {
        console.log('--------------- start --------------');
        [...this.list].reverse().forEach(record => {
            console.log(record);
        });
        console.log('--------------- end --------------');
    }

    execute(record: Record, isUndo = false) {
        const { type, infos, combine } = record;
        if (
            type === OperateType.Update ||
            type === OperateType.Add ||
            type === OperateType.Delete
        ) {
            infos.forEach(info => {
                const { target, targetType, props = {} } = info;
                if (type === OperateType.Update) {
                    Object.keys(props).forEach(property => {
                        const { oldValue, newValue, oldValueType, newValueType } = props[property];
                        if (isUndo) {
                            setValue(target, property, cloneValue(oldValue, oldValueType));
                        } else {
                            setValue(target, property, cloneValue(newValue, newValueType));
                        }
                    });
                } else if (type === OperateType.Add) {
                    if (isUndo) {
                        this.executeDelete(targetType, target);
                    } else {
                        this.executeAdd(targetType, target);
                    }
                } else if (type === OperateType.Delete) {
                    if (isUndo) {
                        this.executeAdd(targetType, target);
                    } else {
                        this.executeDelete(targetType, target);
                    }
                }
            });
        } else if (
            type === OperateType.Combine ||
            type === OperateType.Uncombine
        ) {
            combine.forEach(item => {
                const { parent, children } = item;
                if (type === OperateType.Combine) {
                    if (isUndo) {
                        this.root.unmergeNodes(parent);
                    } else {
                        this.root.mergeNodes(children, parent);
                    }
                } else if (type === OperateType.Uncombine) {
                    if (isUndo) {
                        this.root.mergeNodes(children, parent);
                    } else {
                        this.root.unmergeNodes(parent);
                    }
                }
            });
        }
    }

    executeAdd(type: TargetType, target: any) {
        switch (type) {
            case TargetType.Mesh:
                this.root.addNodes(target);
        }
    }

    executeDelete(type: TargetType, target: any) {
        switch (type) {
            case TargetType.Mesh:
                this.root.removeNodes(target, true);
        }
    }
}