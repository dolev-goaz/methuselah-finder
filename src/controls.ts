import config from "@/config.json";

type fn<T extends any[] = []> = (...args: T) => void;
type ControlsData = {
    spreadSheetExport: fn;
    step: fn;
    onChangeSize: fn<[number]>;
    onChangeSpeed: fn<[number]>;
}

export function setupControls(options: ControlsData) {
    createExport(options.spreadSheetExport);
    createLoopControls(options.onChangeSpeed);
    createStepButton(options.step);
    createGridSizeControl(options.onChangeSize);
}

function createGridSizeControl(onChange: fn<[number]>) {
    const size = document.querySelector<HTMLInputElement>('input#grid-size')!;
    size.value = config.CellSize.Initial.toString();
    size.min = config.CellSize.Min.toString();
    size.max = config.CellSize.Max.toString();
    size.oninput = () => {
        onChange(parseInt(size.value));
    }
}

function createExport(exportMethod: fn) {
    const button = document.querySelector<HTMLButtonElement>('button#export-excel')
    if (!button) return;
    button.onclick = exportMethod;
}

function createLoopControls(onSpeedChange: fn<[number]>) {
    const initialSliderValue = 2;
    let timePerFrame = 1000 / initialSliderValue;
    onSpeedChange(timePerFrame);

    const slider = document.querySelector<HTMLInputElement>("input[type=range]#auto-step-speed")!;
    const sliderLabel = document.querySelector<HTMLLabelElement>('[for=auto-step-speed]')!;

    slider.min = "1";
    slider.max = "100";
    slider.step = "1";
    slider.value = initialSliderValue.toString();
    slider.title = `steps per second- ${slider.value}`;
    sliderLabel.innerText = `steps per second- ${slider.value}`;

    slider.oninput = () => {
        timePerFrame = 1000 / Number(slider.value);
        slider.title = `steps per second- ${slider.value}`;
        sliderLabel.innerText = `steps per second- ${slider.value}`;
        onSpeedChange(timePerFrame);
    };
}

function createStepButton(stepMethod: fn) {
    const button = document.querySelector<HTMLInputElement>("button[type=button]#step")!;
    button.onclick = stepMethod;
}