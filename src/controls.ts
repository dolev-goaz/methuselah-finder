import config from "@/config.json";

type fn<T extends any[] = [], TOut = void> = (...args: T) => TOut;
type ControlsData = {
    step: fn;
    onChangeSize: fn<[number]>;
    onChangeSpeed: fn<[number]>;
    onCalculate: fn;
    onRun: fn;
}

export function setupControls(options: ControlsData) {
    createCalculateButton(options.onCalculate);
    createRunButton(options.onRun);
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

function createLoopControls(onSpeedChange: fn<[number]>) {
    const initialSliderValue = config.InitialStepsPerSecond;
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

function createCalculateButton(onStart: fn) {
    const calculateButton = document.querySelector<HTMLInputElement>("button[type=button]#start-algorithm")!;
    const startButton = document.querySelector<HTMLInputElement>("button[type=button]#start-simulation")!;
    calculateButton.onclick = () => {
        calculateButton.hidden = true;
        startButton.hidden = false;
        onStart();
    };
}

function createRunButton(onRun: fn) {
    const startButton = document.querySelector<HTMLInputElement>("button[type=button]#start-simulation")!;
    startButton.onclick = () => {
        onRun();
        startButton.hidden = true;
    }
}

function createStepButton(stepMethod: fn) {
    const button = document.querySelector<HTMLInputElement>("button[type=button]#step")!;
    button.onclick = stepMethod;
}
