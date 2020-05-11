export class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    static equals(cell1, cell2) {
        if(cell1 instanceof Cell && cell2 instanceof Cell)
            return cell1.row == cell2.row && cell1.col == cell2.col;
        return false;
    }
}

export class CellHashSet {
    constructor(size=10) {
        this.bucket = [];
        this.size = size;
        this.hash = (value) => {return (value.row + value.col) % this.size};
        for(let i = 0; i < size; i++) {
            this.bucket.push([]);
        }
    }   

    has(value) {
        if(value instanceof Cell) {
            let key = this.hash(value);
            let values = this.bucket[key];
            for(let i = 0; i < values.length; i++) {
                if(Cell.equals(values[i], value)) {
                    return true;
                }
            }
        }
        return false;
    }

    add(value) {
        if(value instanceof Cell && !this.has(value)) {
            let key = this.hash(value);
            this.bucket[key].push(value);
            return true;
        }
        return false;
    }

    remove(value) {
        if(value instanceof Cell && this.has(value)) {
            let key = this.hash(value);
            let values = this.bucket[key];
            for(let i = 0; i < values.length; i++) {
                if(Cell.equals(values[i], value)) {
                    values.splice(i, 1);
                    break;
                }
            }
            return true;
        }
        return false;
    }
}

export default {Cell, CellHashSet};