function fetchExectuion() {

}

function DummyPipe() {
    this.name = "Dummy Pipeline";

    this.fetch = new PipelineStep("fetch", fetchExectuion);
}