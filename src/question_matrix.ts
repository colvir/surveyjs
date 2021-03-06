﻿import {Base} from "./base";
import {ItemValue} from "./itemvalue";
import {Question} from "./question";
import {JsonObject} from "./jsonobject";
import {SurveyError} from "./base";
import {surveyLocalization} from './surveyStrings';
import {CustomError} from "./error";
import {QuestionFactory} from "./questionfactory";
import {LocalizableString} from "./localizablestring";

export interface IMatrixData {
    onMatrixRowChanged(row: MatrixRowModel);
}
export class MatrixRowModel extends Base {
    private data: IMatrixData;
    private item: ItemValue;
    protected rowValue: any; 

    constructor(item: ItemValue, public fullName: string, data: IMatrixData, value: any) {
        super();
        this.item = item;
        this.data = data;
        this.rowValue = value;
    }
    public get name(): string { return this.item.value; } 
    public get text(): string { return this.item.text; } 
    public get locText(): LocalizableString { 
        return this.item.locText; 
    }
    public get value() { return this.rowValue; }
    public set value(newValue: any) {
        this.rowValue = newValue;
        if (this.data) this.data.onMatrixRowChanged(this);
        this.onValueChanged();
    }
    protected onValueChanged() {
    }
}
export class QuestionMatrixModel extends Question implements IMatrixData {

    clone(): QuestionMatrixModel{
        let newQuestion = new QuestionMatrixModel(this.name, this.title);
        if(this.value) newQuestion.onSurveyValueChanged(JSON.parse(JSON.stringify(this.value)));
        return newQuestion;
    }

    private columnsValue: Array<ItemValue>;
    private rowsValue: Array<ItemValue>;
    private isRowChanging = false;
    private generatedVisibleRows: Array<MatrixRowModel>;
    public isAllRowRequired: boolean = false;
    constructor(public name: string, title?: string) {
        super(name, title);
        this.columnsValue = ItemValue.createArray(this);
        this.rowsValue = ItemValue.createArray(this);
    }
    public getType(): string {
        return "matrix";
    }
    public get hasRows(): boolean {
        return this.rowsValue.length > 0;
    }
    get columns(): Array<any> { return this.columnsValue; }
    set columns(newValue: Array<any>) {
        ItemValue.setData(this.columnsValue, newValue);
    }
    get rows(): Array<any> { return this.rowsValue; }
    set rows(newValue: Array<any>) {
        ItemValue.setData(this.rowsValue, newValue);
    }
    public get visibleRows(): Array<MatrixRowModel> {
        var result = new Array<MatrixRowModel>();
        var val = this.value;
        if (!val) val = {};
        for (var i = 0; i < this.rows.length; i++) {
            if (!this.rows[i].value) continue;
            result.push(this.createMatrixRow(this.rows[i], this.name + '_' + this.rows[i].value.toString(), val[this.rows[i].value]));
        }
        if (result.length == 0) {
            result.push(this.createMatrixRow(new ItemValue(null), this.name, val));
        }
        this.generatedVisibleRows = result;
        return result;
    }
    public onLocaleChanged() {
        super.onLocaleChanged();
        ItemValue.NotifyArrayOnLocaleChanged(this.columns);
        ItemValue.NotifyArrayOnLocaleChanged(this.rows);
    }
    supportGoNextPageAutomatic() { return this.hasValuesInAllRows(); }
    protected onCheckForErrors(errors: Array<SurveyError>) {
        super.onCheckForErrors(errors);
        if (this.hasErrorInRows()) {
            this.errors.push(new CustomError(surveyLocalization.getString("requiredInAllRowsError")));
        }
    }
    private hasErrorInRows(): boolean {
        if (!this.isAllRowRequired) return false;
        return !this.hasValuesInAllRows();
    }
    private hasValuesInAllRows(): boolean {
        var rows = this.generatedVisibleRows;
        if (!rows) rows = this.visibleRows;
        if (!rows) return true;
        for (var i = 0; i < rows.length; i++) {
            var val = rows[i].value;
            if (!val) return false;
        }
        return true;
    }
    protected createMatrixRow(item: ItemValue, fullName: string, value: any): MatrixRowModel {
        return new MatrixRowModel(item, fullName, this, value);
    }
    protected onValueChanged() {
        if (this.isRowChanging || !(this.generatedVisibleRows) || this.generatedVisibleRows.length == 0) return;
        this.isRowChanging = true;
        var val = this.value;
        if (!val) val = {};
        if (this.rows.length == 0) {
            this.generatedVisibleRows[0].value = val;
        } else {
            for (var i = 0; i < this.generatedVisibleRows.length; i++) {
                var row = this.generatedVisibleRows[i];
                var rowVal = val[row.name] ? val[row.name] : null;
                this.generatedVisibleRows[i].value = rowVal;
            }
        }
        this.isRowChanging = false;
    }
    //IMatrixData
    onMatrixRowChanged(row: MatrixRowModel) {
        if (this.isRowChanging) return;
        this.isRowChanging = true;
        if (!this.hasRows) {
            this.setNewValue(row.value);
        } else {
            var newValue = this.value;
            if (!newValue) {
                newValue = {};
            }
            newValue[row.name] = row.value;
            this.setNewValue(newValue);
        }
        this.isRowChanging = false;
    }
}

JsonObject.metaData.addClass("matrix", [{ name: "columns:itemvalues", onGetValue: function (obj: any) { return ItemValue.getData(obj.columns); }, onSetValue: function (obj: any, value: any) { obj.columns = value; }},
    { name: "rows:itemvalues", onGetValue: function (obj: any) { return ItemValue.getData(obj.rows); }, onSetValue: function (obj: any, value: any) { obj.rows = value; } },
    "isAllRowRequired:boolean"],  function () { return new QuestionMatrixModel(""); }, "question");

QuestionFactory.Instance.registerQuestion("matrix", (name) => { var q = new QuestionMatrixModel(name); q.rows = QuestionFactory.DefaultRows; q.columns = QuestionFactory.DefaultColums; return q; });