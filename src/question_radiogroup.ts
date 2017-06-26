import {JsonObject} from "./jsonobject";
import {QuestionFactory} from "./questionfactory";
import {QuestionCheckboxBase} from "./question_baseselect";

export class QuestionRadiogroupModel extends QuestionCheckboxBase {
    constructor(public name: string, title?: string) {
        super(name, title);
    }
    public getType(): string {
        return "radiogroup";
    }
    supportGoNextPageAutomatic() { return true; }

    clone(): QuestionRadiogroupModel{
        let newQuestion = new QuestionRadiogroupModel(this.name, this.title);
        if(this.value) newQuestion.onSurveyValueChanged(JSON.parse(JSON.stringify(this.value)));
        newQuestion.choices = this.choices;
        return newQuestion;
    }
}

JsonObject.metaData.addClass("radiogroup", [], function () { return new QuestionRadiogroupModel(""); }, "checkboxbase");

QuestionFactory.Instance.registerQuestion("radiogroup", (name) => { var q = new QuestionRadiogroupModel(name); q.choices = QuestionFactory.DefaultChoices; return q;});