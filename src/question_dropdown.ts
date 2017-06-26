import {JsonObject} from "./jsonobject";
import {QuestionFactory} from "./questionfactory";
import {QuestionSelectBase} from "./question_baseselect";
import {surveyLocalization} from "./surveyStrings";
import {LocalizableString} from "./localizablestring";

export class QuestionDropdownModel extends QuestionSelectBase {

    clone(): QuestionDropdownModel{
        let newQuestion = new QuestionDropdownModel(this.name, this.title);
        if(this.value) newQuestion.onSurveyValueChanged(JSON.parse(JSON.stringify(this.value)));
        return newQuestion;
    }

    private locOptionsCaptionValue: LocalizableString;
    constructor(public name: string, title?: string) {
        super(name, title);
        this.locOptionsCaptionValue = new LocalizableString(this);
    }
    public get optionsCaption() { return this.locOptionsCaption.text ? this.locOptionsCaption.text : surveyLocalization.getString("optionsCaption"); }
    public set optionsCaption(newValue: string) { this.locOptionsCaption.text = newValue; }
    public get locOptionsCaption(): LocalizableString { return this.locOptionsCaptionValue;}
    public getType(): string {
        return "dropdown";
    }
    public onLocaleChanged() {
        super.onLocaleChanged();
        this.locOptionsCaption.onChanged();
    }
    supportGoNextPageAutomatic() { return true; }
}
JsonObject.metaData.addClass("dropdown", [{ name: "optionsCaption", serializationProperty: "locOptionsCaption"}],
    function () { return new QuestionDropdownModel(""); }, "selectbase");
QuestionFactory.Instance.registerQuestion("dropdown", (name) => { var q = new QuestionDropdownModel(name); q.choices = QuestionFactory.DefaultChoices; return q; });