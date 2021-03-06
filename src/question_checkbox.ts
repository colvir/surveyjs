﻿import {JsonObject} from "./jsonobject";
import {QuestionFactory} from "./questionfactory";
import {QuestionCheckboxBase} from "./question_baseselect";

export class QuestionCheckboxModel extends QuestionCheckboxBase {

    clone(): QuestionCheckboxModel{
        let newQuestion = new QuestionCheckboxModel(this.name, this.title);
        if(this.value) newQuestion.onSurveyValueChanged(JSON.parse(JSON.stringify(this.value)));
        return newQuestion;
    }

    constructor(public name: string, title?: string) {
        super(name, title);
    }
    protected getHasOther(val: any): boolean {
        if (!val || !Array.isArray(val)) return false;
        return val.indexOf(this.otherItem.value) >= 0;
    }
    protected valueFromData(val: any): any {
        if (!val) return val;
        if(!Array.isArray(val)) return [val];
        return super.valueFromData(val);
    }
    protected valueFromDataCore(val: any): any {
        for (var i = 0; i < val.length; i++) {
            if (val[i] == this.otherItem.value) return val;
            if (this.hasUnknownValue(val[i])) {
                this.comment = val[i];
                var newVal = val.slice();
                newVal[i] = this.otherItem.value;
                return newVal;
            }
        }
        return val;
    }
    protected valueToDataCore(val: any): any {
        if (!val || !val.length) return val;
        for (var i = 0; i < val.length; i++) {
            if (val[i] == this.otherItem.value) {
                if (this.getComment()) {
                    var newVal = val.slice();
                    newVal[i] = this.getComment();
                    return newVal;
                }
            }
        }
        return val;
    }
    public getType(): string {
        return "checkbox";
    }
}
JsonObject.metaData.addClass("checkbox", [], function () { return new QuestionCheckboxModel(""); }, "checkboxbase");
QuestionFactory.Instance.registerQuestion("checkbox", (name) => { var q = new QuestionCheckboxModel(name); q.choices = QuestionFactory.DefaultChoices; return q; });