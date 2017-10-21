function PipelineStep(nane, execution, params) {
    const pipeStep = this;
    this.name = name;
    this.execution = execution;
    for (let property in params) {
        // Handle each property of params
        this[property] = params[property];
        if (property === "b") {
            // Do something
        }
    }

    this.render = function(prevStep) {
        var count =  containerPipeline.children(`.${prevStep}`).length;
        var instruction = containerPipeline.children(`.${prevStep}:eq(0)`);
        if (count) {
            setTimeout(function() {
                instruction.removeClass(prevStep);//muda as caracteristicas do html (abaixo) pra passar cada bloquinho para a proxima etapa
                instruction.addClass(pipeStep.name);//"<div class='pipeline-item background-info fetch'>" + instruction.name + "</div>"
            }, 80)
        }
    }
}