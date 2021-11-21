export class FileTrunkReader {
    public currentSliceStart: number = 0;

    constructor(public file: File, public trunkSize: number) { }

    public async next(trunkSize?: number): Promise<{ value: string, done: boolean }> {
        let trunkSize_ = trunkSize || this.trunkSize;
        const sliceFile = this.file.slice(this.currentSliceStart, this.currentSliceStart + trunkSize_);
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                this.currentSliceStart += trunkSize_;
                resolve({
                    value: reader.result as string,
                    done: this.currentSliceStart >= this.file.size,
                })
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsText(sliceFile);
        });
    }

    public reset() {
        this.currentSliceStart = 0;
    }
};
