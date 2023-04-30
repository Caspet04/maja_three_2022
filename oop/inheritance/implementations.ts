import { Sorter } from "./interfaces";
import * as fs from "fs";
export class DefaultSorter implements Sorter {
    timed_sort(array: number[]): { array: number[]; milliseconds: number } {
        let start = Date.now();
        let temp = this.sort(array);
        let end = Date.now();
        return { array: temp, milliseconds: end - start };
    }
    sort(array: number[]): number[] {
        return array.sort();
    }
    shuffle(array: number[]): number[] {
        // https://stackoverflow.com/a/2450976
        let currentIndex = array.length;
        let randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex != 0) {
            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }

        return array;
    }
}

export class DefaultSorterTimeLogger extends DefaultSorter {
    override timed_sort(array: number[]): {
        array: number[];
        milliseconds: number;
    } {
        const result = super.timed_sort(array);

        console.log(`Sorted list in ${result.milliseconds} milliseconds`);

        return result;
    }
}

export class BubbleSorter extends DefaultSorterTimeLogger {
    //https://rajat-m.medium.com/implement-5-sorting-algorithms-using-javascript-63c5a917e811
    sort(array: number[]): number[] {
        const new_array = [...array];

        for (let i = 0; i < new_array.length; i++) {
            for (let j = 0; j < new_array.length - 1 - i; j++) {
                [new_array[j + 1], new_array[j]] = [new_array[j], new_array[j + 1]];
            }
        }

        return new_array;
    }
}

export class QuickSorter extends DefaultSorterTimeLogger {
    //https://rajat-m.medium.com/implement-5-sorting-algorithms-using-javascript-63c5a917e811
    private static partition(
        array: number[],
        start: number = 0,
        end: number = array.length - 1
    ): number {
        const pivot = array[start];
        let swap_index = start;

        for (let i = start + 1; i <= end; i++) {
            if (array[i] >= pivot) continue;

            swap_index++;
            [array[i], array[swap_index]] = [array[swap_index], array[i]];
        }

        [array[swap_index], array[start]] = [array[start], array[swap_index]];

        return swap_index;
    }

    private static quick_sort(array: number[], left: number = 0, right: number = array.length - 1) {
        if (left >= right) return array;

        const pivot_index = QuickSorter.partition(array, left, right);
        QuickSorter.quick_sort(array, left, pivot_index - 1);
        QuickSorter.quick_sort(array, pivot_index + 1, right);

        return array;
    }

    sort(array: number[]): number[] {
        return QuickSorter.quick_sort(array);
    }
}

// this sorter does the parent sort and also dumps the result to file
export class QuickSorterTimeFileDumper extends QuickSorter {
    override timed_sort(array: number[]): {
        array: number[];
        milliseconds: number;
    } {
        const result = super.timed_sort(array);
        const file_content = `QuickSorterTimeFileDumper: Recorded time as ${result.milliseconds} milliseconds`;

        fs.writeFile("./log.txt", file_content, (error) => {
            if (error) {
                console.error(error);
            }
        });

        return result;
    }
}
