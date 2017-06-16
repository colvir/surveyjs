/**
 * Created by Denis on 14.04.2017.
 */
import * as React from 'react';
import {QuestionRowModel} from "../panel";
import {SurveyPage, SurveyRow} from "./reactpage";
import {ISurveyCreator} from "./reactquestion";
import {QuestionBase} from "../questionbase";
import {ReactQuestionFactory} from "./reactquestionfactory";
import {HashTable} from "../base";
import {Question} from "../question";

export class SurveyPreviewPage extends SurveyPage implements ISurveyCreator{
	protected answers: HashTable<any>;
	render(): JSX.Element {
		if (this.page == null || this.survey == null || this.creator == null) return null;
		var title = this.renderTitle();
		var rows = [];
		var questionRows = this.page.rows;
		for (var i = 0; i < questionRows.length; i++) {
			rows.push(this.createRow(questionRows[i], i));
		}
		return (
			<div ref="root">
				{title}
				{rows}
			</div>
		);
	}
	protected createRow(row: QuestionRowModel, index: number): JSX.Element {
		let rowName = "row" + (index + 1),
			newRow = row.clone();
		newRow.questions.forEach((q: Question) => {

			if(this.answers[q.name]) q.value = this.answers[q.name];
		});
		return <SurveyRow key={rowName} row={newRow} survey={this.survey} creator={this} css={this.css} />;
	}
	protected renderTitle(): JSX.Element {
		if (!this.page.title || !this.survey.showPageTitles) return null;
		var text = this.page.processedTitle;
		if (this.page.num > 0) {
			text = this.page.num + ". " + text;
		}
		return (<h4 className={this.css.pageTitle}>{text}</h4>);
	}

	//ISurveyCreator
	public createQuestionElement(question: QuestionBase): JSX.Element {
		var questionCss = this.css[question.getType()];
		return ReactQuestionFactory.Instance.createQuestion(question.getType(), {
			question: question, css: questionCss, rootCss: this.css, isDisplayMode: true, creator: this
		});
	}
	public renderError(key: string, errorText: string): JSX.Element {
		return <div key={key} className={this.css.error.item}>{errorText}</div>;
	}
	public questionTitleLocation(): string { return this.survey.questionTitleLocation; }

	constructor(props){
		super(props);
		this.answers = props.answers;
	}
}