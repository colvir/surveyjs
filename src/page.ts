import {JsonObject} from "./jsonobject";
import {Base, IPage, IConditionRunner, ISurvey, IElement, IQuestion, HashTable, SurveyElement, SurveyPageId, INextPageCondition} from "./base";
import {QuestionBase} from "./questionbase";
import {ConditionRunner} from "./conditions";
import {QuestionFactory} from "./questionfactory";
import {PanelModel, PanelModelBase, QuestionRowModel} from "./panel";

export class PageModel extends PanelModelBase implements IPage {
    private numValue: number = -1;
    public navigationButtonsVisibility: string = "inherit";
    private nextPageValue: string = null;
    public nextPage: INextPageCondition[] | string;
    constructor(public name: string = "") {
        super(name);
    }
    public getType(): string { return "page"; }
    public get num() { return this.numValue; }
    public set num(value: number) {
        if (this.numValue == value) return;
        this.numValue = value;
        this.onNumChanged(value);
    }
    protected getRendredTitle(str: string): string {
        str = super.getRendredTitle(str);
        if(this.num > 0) {
            str = this.num  + ". " + str;
        }
        return str;
    }
    public focusFirstQuestion() {
        for (var i = 0; i < this.questions.length; i++) {
            var question = this.questions[i];
            if (!question.visible || !question.hasInput) continue;
            this.questions[i].focus();
            break;
        }
    }
    public focusFirstErrorQuestion() {
        for (var i = 0; i < this.questions.length; i++) {
            if (!this.questions[i].visible || this.questions[i].currentErrorCount == 0) continue;
            this.questions[i].focus(true);
            break;
        }
    }
    public scrollToTop() {
        SurveyElement.ScrollElementToTop(SurveyPageId);
    }
    protected onNumChanged(value: number) {
    }
    protected onVisibleChanged() {
        super.onVisibleChanged();
        if (this.data != null) {
            this.data.pageVisibilityChanged(this, this.visible);
        }
    }

    public runCondition(values: HashTable<any>) {
        super.runCondition(values);
        if(Array.isArray(this.nextPage)){
            let nextPageValue: string = null;
            this.nextPage.some((cond) => {
                let conditionRunner = new ConditionRunner(cond.condition);
                if(conditionRunner.run(values)){
                    nextPageValue = cond.name;
                    return true;
                }
                return false;
            });
            this.nextPageValue = nextPageValue;
        }
    }

    public getNextPage(): string{
        return this.nextPageValue;
    }

};

JsonObject.metaData.addClass("page", [{ name: "navigationButtonsVisibility", default: "inherit", choices: ["iherit", "show", "hide"] },
        { name: "nextPage:expression", onSetValue: function (obj, value){obj.nextPage = value; if(!Array.isArray(value) && value != undefined) obj.nextPageValue = value;}}],
    function () { return new PageModel(); }, "panel");