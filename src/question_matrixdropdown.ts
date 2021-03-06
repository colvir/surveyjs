﻿import {QuestionMatrixDropdownModelBase,
    MatrixDropdownRowModelBase,
    IMatrixDropdownData
} from "./question_matrixdropdownbase";
import {JsonObject} from "./jsonobject";
import {ItemValue} from "./itemvalue";
import {QuestionFactory} from "./questionfactory";
import {surveyLocalization} from "./surveyStrings";
import {LocalizableString} from "./localizablestring";

export class MatrixDropdownRowModel extends MatrixDropdownRowModelBase {
    private item: ItemValue;
    constructor(public name: string, item: ItemValue, data: IMatrixDropdownData, value: any) {
        super(data, value);
        this.item = item;
    }
    public get rowName(): string { return this.name; }
    public get text(): string { return this.item.text; }
    public get locText(): LocalizableString { return this.item.locText; }
}
export class QuestionMatrixDropdownModel extends QuestionMatrixDropdownModelBase implements IMatrixDropdownData {

    clone(): QuestionMatrixDropdownModel{
        let newQuestion = new QuestionMatrixDropdownModel(this.name);
        if(this.value) newQuestion.onSurveyValueChanged(JSON.parse(JSON.stringify(this.value)));
        return newQuestion;
    }

    private rowsValue: Array<ItemValue>;

    constructor(public name: string) {
        super(name);
        this.rowsValue = ItemValue.createArray(this);
    }
    public getType(): string {
        return "matrixdropdown";
    }
    public get rows(): Array<any> { return this.rowsValue; }
    public set rows(newValue: Array<any>) {
        ItemValue.setData(this.rowsValue, newValue);
    }
    public onLocaleChanged() {
        super.onLocaleChanged();
        ItemValue.NotifyArrayOnLocaleChanged(this.rowsValue);
    }
    protected generateRows(): Array<MatrixDropdownRowModel> {
        var result = new Array<MatrixDropdownRowModel>();
        if (!this.rows || this.rows.length === 0) return result;
        var val = this.value;
        if (!val) val = {};
        for (var i = 0; i < this.rows.length; i++) {
            if (!this.rows[i].value) continue;
            result.push(this.createMatrixRow(this.rows[i], val[this.rows[i].value]));
        }
        return result;
    }
    protected createMatrixRow(item: ItemValue, value: any): MatrixDropdownRowModel {
        return new MatrixDropdownRowModel(item.value, item, this, value);
    }
}

JsonObject.metaData.addClass("matrixdropdown", [{ name: "rows:itemvalues", onGetValue: function (obj: any) { return ItemValue.getData(obj.rows); }, onSetValue: function (obj: any, value: any) { obj.rows = value; }}],
    function () { return new QuestionMatrixDropdownModel(""); }, "matrixdropdownbase");

QuestionFactory.Instance.registerQuestion("matrixdropdown", (name) => { var q = new QuestionMatrixDropdownModel(name); q.choices = [1, 2, 3, 4, 5]; q.rows = QuestionFactory.DefaultColums; QuestionMatrixDropdownModelBase.addDefaultColumns(q); return q; });