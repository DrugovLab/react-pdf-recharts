import { FlatDomItem } from "./types";
import { Adapter, Predicate } from 'css-select/lib/types';

export default class CSSSelectAdapter implements Adapter<FlatDomItem, FlatDomItem> {
    
    protected items!: FlatDomItem[];
    
    constructor(items: FlatDomItem[]){
        this.items = items;
    }

    isTag(node: FlatDomItem): node is FlatDomItem {
        return true;
    }
    
    existsOne(test: Predicate<FlatDomItem> , elems: FlatDomItem[]): boolean {
        return elems.some(elem => {
            return test(elem) || this.existsOne(test, this.getChildren(elem));
        });
    }

    getAttributeValue(elem: FlatDomItem, name: string) {
        if (name == 'class') name = 'classname';
        const propKey = Object.keys(elem.element.props).find(key => key.toLowerCase() === name);
        return propKey == null ? null : elem.element.props[propKey];
    }

    getChildren(node: FlatDomItem) {
        return this.items.filter(x => x.parent?.element == node.element);
    }

    getName(elem: FlatDomItem) {
        const name = `${elem.element.type}`;
        return name.toLowerCase();
    }

    getParent(node: FlatDomItem) {
        return node.parent?.element == null ? null : this.items.find(x => x.element == node.parent!.element) || null;
    }

    getSiblings(node: FlatDomItem) {
        const indexes = [node.index - 1, node.index, node.index + 1];
        return this.items.filter(x => x.parent?.element == node.parent?.element && indexes.includes(x.index))
    }

    prevElementSibling(node: FlatDomItem) {
        if (node.index == 0) return null;
        return this.items.find(x => x.parent?.element == node.parent?.element && x.index == node.index - 1) || null;
    }

    getText(node: FlatDomItem) {
        return null as any;
    }

    hasAttrib(elem: FlatDomItem, name: string) {
        return elem.element.props.hasOwnProperty(name);
    }

    removeSubsets(nodes: FlatDomItem[]) {
        return nodes;
    }

    findAll(test: Predicate<FlatDomItem>, nodes: FlatDomItem[]) {
        return nodes.filter(node => test(node));
    }

    findOne(test: Predicate<FlatDomItem>, elems: FlatDomItem[]) {
        return elems.find(test) || null;
    }

    equals(a: FlatDomItem, b: FlatDomItem) {
        return a.element == b.element;
    }

    isHovered(elem: any) {
        return false;
    }

    isVisited(elem: any) {
        return false;
    }

    isActive(elem: any) {
        return false;
    }
}