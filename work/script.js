// ==============================
// 基本設定
// ==============================

const MONTHLY_LIMIT_MINUTES =
    262 * 60;


// 13勤務目フル勤務
// 19時間40分
const FULL_FINAL_SHIFT_MINUTES =
    19 * 60 + 40;


// 12勤務終了時点の目標
// 262:00 - 19:40 = 242:20
const TWELVE_SHIFT_TARGET_MINUTES =
    MONTHLY_LIMIT_MINUTES -
    FULL_FINAL_SHIFT_MINUTES;


// ==============================
// 要素
// ==============================

const saveButton =
    document.getElementById("saveButton");

const directInput =
    document.getElementById("directInput");

const timeInput =
    document.getElementById("timeInput");

const startTimeInput =
    document.getElementById("startTime");

const endTimeInput =
    document.getElementById("endTime");


// ==============================
// 入力方法切替
// ==============================

document
    .querySelectorAll(
        'input[name="inputType"]'
    )
    .forEach(radio => {

        radio.addEventListener(
            "change",
            () => {

                const type =
                    getInputType();


                if (type === "direct") {

                    directInput.classList.remove(
                        "hidden"
                    );

                    timeInput.classList.add(
                        "hidden"
                    );

                } else {

                    directInput.classList.add(
                        "hidden"
                    );

                    timeInput.classList.remove(
                        "hidden"
                    );

                    calculateFromTimes();
                }
            }
        );
    });


// ==============================
// 出庫帰庫から自動計算
// ==============================

startTimeInput.addEventListener(
    "input",
    calculateFromTimes
);

endTimeInput.addEventListener(
    "input",
    calculateFromTimes
);


function calculateFromTimes() {

    const startTime =
        startTimeInput.value;

    const endTime =
        endTimeInput.value;


    if (!startTime || !endTime) {

        document.getElementById(
            "calculatedHours"
        ).textContent = "--";

        return null;
    }


    const minutes =
        calculateWorkMinutes(
            startTime,
            endTime
        );


    document.getElementById(
        "calculatedHours"
    ).textContent =
        formatMinutes(minutes);


    return minutes;
}


// ==============================
// 出庫帰庫 → 拘束時間
// ==============================

function calculateWorkMinutes(
    startTime,
    endTime
) {

    const [startHour, startMinute] =
        startTime
            .split(":")
            .map(Number);


    const [endHour, endMinute] =
        endTime
            .split(":")
            .map(Number);


    let start =
        startHour * 60 +
        startMinute;


    let end =
        endHour * 60 +
        endMinute;


    if (end <= start) {

        end +=
            24 * 60;
    }


    return (
        (end + 20) -
        (start - 20)
    );
}


// ==============================
// 新規保存
// ==============================

saveButton.addEventListener(
    "click",
    () => {

        const workDate =
            document.getElementById(
                "workDate"
            ).value;


        if (!workDate) {

            alert(
                "勤務日を入力してください。"
            );

            return;
        }


        const inputType =
            getInputType();


        let minutes;

        let startTime =
            null;

        let endTime =
            null;


        if (inputType === "direct") {

            const hoursValue =
                document.getElementById(
                    "directHours"
                ).value;


            const minutesValue =
                document.getElementById(
                    "directMinutes"
                ).value;


            const hours =
                Number(hoursValue);


            const mins =
                Number(minutesValue);


            if (
                hoursValue === "" ||
                minutesValue === "" ||
                !Number.isFinite(hours) ||
                !Number.isFinite(mins) ||
                hours < 0 ||
                mins < 0 ||
                mins > 59 ||
                (
                    hours === 0 &&
                    mins === 0
                )
            ) {

                alert(
                    "拘束時間を正しく入力してください。"
                );

                return;
            }


            minutes =
                hours * 60 +
                mins;

        } else {

            minutes =
                calculateFromTimes();


            if (minutes === null) {

                alert(
                    "出庫時刻と帰庫時刻を入力してください。"
                );

                return;
            }


            startTime =
                startTimeInput.value;


            endTime =
                endTimeInput.value;
        }


        const records =
            getAllRecords();


        records.push({

            id:
                Date.now(),

            date:
                workDate,

            inputType:
                inputType,

            startTime:
                startTime,

            endTime:
                endTime,

            minutes:
                minutes

        });


        saveAllRecords(
            records
        );


        updateAllDisplays();

        clearInputs();


        alert(
            "勤務を保存しました。"
        );
    }
);


// ==============================
// 入力方法
// ==============================

function getInputType() {

    return document.querySelector(
        'input[name="inputType"]:checked'
    ).value;
}


// ==============================
// 入力クリア
// ==============================

function clearInputs() {

    document.getElementById(
        "directHours"
    ).value = "";


    document.getElementById(
        "directMinutes"
    ).value = "";


    startTimeInput.value = "";

    endTimeInput.value = "";


    document.getElementById(
        "calculatedHours"
    ).textContent = "--";
}


// ==============================
// モーダル
// ==============================

document.getElementById(
    "statusButton"
).addEventListener(
    "click",
    () => {

        updateAllDisplays();

        openModal(
            "statusModal"
        );
    }
);


document.getElementById(
    "historyButton"
).addEventListener(
    "click",
    () => {

        updateAllDisplays();

        openModal(
            "historyModal"
        );
    }
);


document.getElementById(
    "previousStatusButton"
).addEventListener(
    "click",
    () => {

        closeModal(
            "statusModal"
        );

        openModal(
            "previousStatusModal"
        );
    }
);


document.getElementById(
    "previousHistoryButton"
).addEventListener(
    "click",
    () => {

        closeModal(
            "historyModal"
        );

        openModal(
            "previousHistoryModal"
        );
    }
);


document
    .querySelectorAll(
        ".close-button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                closeModal(
                    button.dataset.close
                );
            }
        );
    });


function openModal(id) {

    document
        .getElementById(id)
        .classList.remove("hidden");
}


function closeModal(id) {

    document
        .getElementById(id)
        .classList.add("hidden");
}


document
    .querySelectorAll(".modal")
    .forEach(modal => {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    modal.classList.add(
                        "hidden"
                    );
                }
            }
        );
    });


// ==============================
// 15時 / 16時切替
// ==============================

document
    .querySelectorAll(
        'input[name="finalShiftType"]'
    )
    .forEach(radio => {

        radio.addEventListener(
            "change",
            () => {

                updateAllDisplays();
            }
        );
    });


// ==============================
// 全表示更新
// ==============================

function updateAllDisplays() {

    const records =
        getAllRecords();


    const today =
        new Date();


    const currentPeriod =
        getWorkPeriod(today);


    const previousPeriod =
        getPreviousPeriod(
            currentPeriod.startDate
        );


    const currentRecords =
        filterRecordsByPeriod(
            records,
            currentPeriod
        );


    const previousRecords =
        filterRecordsByPeriod(
            records,
            previousPeriod
        );


    const currentTotal =
        getTotalMinutes(
            currentRecords
        );


    const previousTotal =
        getTotalMinutes(
            previousRecords
        );


    // 今月

    document.getElementById(
        "currentPeriod"
    ).textContent =
        formatPeriod(
            currentPeriod
        );


    document.getElementById(
        "historyPeriod"
    ).textContent =
        formatPeriod(
            currentPeriod
        );


    document.getElementById(
        "workCount"
    ).textContent =
        `${currentRecords.length} / 13`;


    document.getElementById(
        "totalHours"
    ).textContent =
        formatMinutes(
            currentTotal
        );


    document.getElementById(
        "remainingHours"
    ).textContent =
        formatMinutes(
            MONTHLY_LIMIT_MINUTES -
            currentTotal
        );


    // 前月

    document.getElementById(
        "previousPeriod"
    ).textContent =
        formatPeriod(
            previousPeriod
        );


    document.getElementById(
        "previousHistoryPeriod"
    ).textContent =
        formatPeriod(
            previousPeriod
        );


    document.getElementById(
        "previousWorkCount"
    ).textContent =
        `${previousRecords.length} / 13`;


    document.getElementById(
        "previousTotalHours"
    ).textContent =
        formatMinutes(
            previousTotal
        );


    // 履歴

    updateHistory(
        currentRecords,
        "workHistory"
    );


    updateHistory(
        previousRecords,
        "previousWorkHistory"
    );


    updateForecast(
        currentRecords
    );
}


// ==============================
// 13勤務目予測
// ==============================

function updateForecast(records) {

    const forecast =
        document.getElementById(
            "forecast"
        );


    const count =
        records.length;


    const totalMinutes =
        getTotalMinutes(
            records
        );


    if (count === 0) {

        forecast.textContent =
            "まだ勤務記録がありません。";

        return;
    }


    if (count >= 13) {

        const remaining =
            MONTHLY_LIMIT_MINUTES -
            totalMinutes;


        forecast.innerHTML = `
            <div class="forecast-box">

                <div class="forecast-main">
                    13勤務を記録済みです
                </div>

                <div class="forecast-line">
                    <span>累計拘束時間</span>

                    <strong>
                        ${formatMinutes(
                            totalMinutes
                        )}
                    </strong>
                </div>

                <div class="forecast-line">
                    <span>262時間との差</span>

                    <strong>
                        ${formatSignedDifference(
                            remaining
                        )}
                    </strong>
                </div>

            </div>
        `;

        return;
    }


    const averageMinutes =
        totalMinutes /
        count;


    const shiftsBeforeFinal =
        12 - count;


    let allowedAverage =
        null;


    if (shiftsBeforeFinal > 0) {

        allowedAverage =
            (
                TWELVE_SHIFT_TARGET_MINUTES -
                totalMinutes
            ) /
            shiftsBeforeFinal;
    }


    const projectedTwelveTotal =
        totalMinutes +
        averageMinutes *
        shiftsBeforeFinal;


    const projectedFinalAvailable =
        MONTHLY_LIMIT_MINUTES -
        projectedTwelveTotal;


    const shiftType =
        Number(
            document.querySelector(
                'input[name="finalShiftType"]:checked'
            ).value
        );


    const normalReturnMinutes =
        shiftType === 15
            ? 10 * 60
            : 11 * 60;


    const shortage =
        FULL_FINAL_SHIFT_MINUTES -
        projectedFinalAvailable;


    const predictedReturnMinutes =
        normalReturnMinutes -
        shortage;


    let mainMessage;


    if (
        projectedFinalAvailable >=
        FULL_FINAL_SHIFT_MINUTES
    ) {

        mainMessage =
            shiftType === 15

                ? "現在のペースなら10:00帰庫まで確保できる見込み"

                : "現在のペースなら11:00帰庫まで確保できる見込み";

    } else if (
        projectedFinalAvailable > 0
    ) {

        mainMessage =
            `現在のペースでは13勤務目は${formatClockTime(
                predictedReturnMinutes
            )}頃までの見込み`;

    } else {

        mainMessage =
            "現在のペースでは13勤務目の拘束時間を確保できません";
    }


    let adjustmentHtml =
        "";


    if (shiftsBeforeFinal > 0) {

        if (allowedAverage >= 0) {

            adjustmentHtml = `
                <div class="forecast-line">

                    <span>
                        13勤務目をフルで残すには
                    </span>

                    <strong>
                        残り${shiftsBeforeFinal}勤務を<br>
                        平均${formatMinutes(
                            Math.floor(
                                allowedAverage
                            )
                        )}以内
                    </strong>

                </div>
            `;

        } else {

            adjustmentHtml = `
                <div class="forecast-line">

                    <span>
                        13勤務目フル確保
                    </span>

                    <strong>
                        現時点で242時間20分を超過
                    </strong>

                </div>
            `;
        }

    } else {

        const finalAvailable =
            MONTHLY_LIMIT_MINUTES -
            totalMinutes;


        adjustmentHtml = `
            <div class="forecast-line">

                <span>
                    13勤務目に使える拘束時間
                </span>

                <strong>
                    ${formatMinutes(
                        finalAvailable
                    )}
                </strong>

            </div>
        `;
    }


    forecast.innerHTML = `
        <div class="forecast-box">

            <div class="forecast-main">
                ${mainMessage}
            </div>

            <div class="forecast-line">

                <span>
                    現在の平均拘束
                </span>

                <strong>
                    ${formatMinutes(
                        Math.round(
                            averageMinutes
                        )
                    )}
                </strong>

            </div>

            <div class="forecast-line">

                <span>
                    12勤務終了目標
                </span>

                <strong>
                    242時間20分以内
                </strong>

            </div>

            ${adjustmentHtml}

            <div class="forecast-note">
                13勤務目を通常どおり使うため、
                19時間40分を残す前提で計算しています。
                15時出庫は10:00帰庫、
                16時出庫は11:00帰庫を基本としています。
            </div>

        </div>
    `;
}


// ==============================
// 期間
// ==============================

function getWorkPeriod(date) {

    const year =
        date.getFullYear();

    const month =
        date.getMonth();

    const day =
        date.getDate();


    let startDate;

    let endDate;


    if (day >= 16) {

        startDate =
            new Date(
                year,
                month,
                16
            );


        endDate =
            new Date(
                year,
                month + 1,
                15
            );

    } else {

        startDate =
            new Date(
                year,
                month - 1,
                16
            );


        endDate =
            new Date(
                year,
                month,
                15
            );
    }


    startDate.setHours(
        0, 0, 0, 0
    );


    endDate.setHours(
        23, 59, 59, 999
    );


    return {
        startDate,
        endDate
    };
}


function getPreviousPeriod(
    currentStartDate
) {

    const previousDay =
        new Date(
            currentStartDate
        );


    previousDay.setDate(
        previousDay.getDate() - 1
    );


    return getWorkPeriod(
        previousDay
    );
}


// ==============================
// 期間抽出
// ==============================

function filterRecordsByPeriod(
    records,
    period
) {

    return records.filter(
        record => {

            const recordDate =
                new Date(
                    record.date +
                    "T00:00:00"
                );


            return (
                recordDate >=
                    period.startDate &&

                recordDate <=
                    period.endDate
            );
        }
    );
}


// ==============================
// 履歴表示
// ==============================

function updateHistory(
    records,
    elementId
) {

    const element =
        document.getElementById(
            elementId
        );


    element.innerHTML = "";


    if (records.length === 0) {

        element.textContent =
            "勤務記録はありません。";

        return;
    }


    const sorted =
        [...records].sort(
            (a, b) =>
                new Date(a.date) -
                new Date(b.date)
        );


    sorted.forEach(record => {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "history-row";


        const top =
            document.createElement(
                "div"
            );


        top.className =
            "history-top";


        const info =
            document.createElement(
                "div"
            );


        info.className =
            "history-info";


        const date =
            new Date(
                record.date +
                "T00:00:00"
            );


        const dateText =
            `${date.getMonth() + 1}/${date.getDate()}`;


        let inputText;


        if (
            record.inputType ===
            "time"
        ) {

            inputText =
                `${record.startTime} → ${record.endTime}`;

        } else {

            inputText =
                "直接入力";
        }


        info.innerHTML = `
            <strong>
                ${dateText}
            </strong>
            <br>

            ${inputText}
            <br>

            ${formatMinutes(
                record.minutes
            )}
        `;


        const actions =
            document.createElement(
                "div"
            );


        actions.className =
            "history-actions";


        // 修正
        const editButton =
            document.createElement(
                "button"
            );


        editButton.textContent =
            "修正";


        editButton.className =
            "edit-button";


        editButton.addEventListener(
            "click",
            () => {

                showEditForm(
                    row,
                    record
                );
            }
        );


        // 削除
        const deleteButton =
            document.createElement(
                "button"
            );


        deleteButton.textContent =
            "削除";


        deleteButton.className =
            "delete-button";


        deleteButton.addEventListener(
            "click",
            () => {

                const result =
                    confirm(
                        `${dateText}の勤務記録を削除しますか？`
                    );


                if (!result) {

                    return;
                }


                deleteRecord(
                    record
                );
            }
        );


        actions.appendChild(
            editButton
        );


        actions.appendChild(
            deleteButton
        );


        top.appendChild(
            info
        );


        top.appendChild(
            actions
        );


        row.appendChild(
            top
        );


        element.appendChild(
            row
        );
    });
}


// ==============================
// 編集フォーム
// ==============================

function showEditForm(
    row,
    record
) {

    // すでに開いていたら何もしない
    if (
        row.querySelector(
            ".edit-form"
        )
    ) {

        return;
    }


    const form =
        document.createElement(
            "div"
        );


    form.className =
        "edit-form";


    // ==========================
    // 直接入力記録
    // ==========================

    if (
        record.inputType !==
        "time"
    ) {

        const hours =
            Math.floor(
                record.minutes / 60
            );


        const mins =
            record.minutes % 60;


        form.innerHTML = `
            <label>
                勤務日
            </label>

            <input
                type="date"
                class="edit-date"
                value="${record.date}"
            >

            <label>
                拘束時間
            </label>

            <div class="edit-duration">

                <input
                    type="number"
                    class="edit-hours"
                    min="0"
                    max="30"
                    inputmode="numeric"
                    value="${hours}"
                >

                <span>時間</span>

                <input
                    type="number"
                    class="edit-minutes"
                    min="0"
                    max="59"
                    inputmode="numeric"
                    value="${mins}"
                >

                <span>分</span>

            </div>

            <div class="edit-actions">

                <button
                    class="edit-save-button"
                >
                    修正を保存
                </button>

                <button
                    class="edit-cancel-button"
                >
                    キャンセル
                </button>

            </div>
        `;


        form
            .querySelector(
                ".edit-save-button"
            )
            .addEventListener(
                "click",
                () => {

                    const newDate =
                        form.querySelector(
                            ".edit-date"
                        ).value;


                    const hoursValue =
                        form.querySelector(
                            ".edit-hours"
                        ).value;


                    const minutesValue =
                        form.querySelector(
                            ".edit-minutes"
                        ).value;


                    const newHours =
                        Number(
                            hoursValue
                        );


                    const newMinutes =
                        Number(
                            minutesValue
                        );


                    if (
                        !newDate ||
                        hoursValue === "" ||
                        minutesValue === "" ||
                        !Number.isFinite(
                            newHours
                        ) ||
                        !Number.isFinite(
                            newMinutes
                        ) ||
                        newHours < 0 ||
                        newMinutes < 0 ||
                        newMinutes > 59 ||
                        (
                            newHours === 0 &&
                            newMinutes === 0
                        )
                    ) {

                        alert(
                            "入力内容を確認してください。"
                        );

                        return;
                    }


                    const total =
                        newHours * 60 +
                        newMinutes;


                    updateRecord(
                        record,
                        {
                            date:
                                newDate,

                            inputType:
                                "direct",

                            startTime:
                                null,

                            endTime:
                                null,

                            minutes:
                                total
                        }
                    );
                }
            );

    }


    // ==========================
    // 出庫帰庫記録
    // ==========================

    else {

        form.innerHTML = `
            <label>
                勤務日
            </label>

            <input
                type="date"
                class="edit-date"
                value="${record.date}"
            >

            <label>
                出庫時刻
            </label>

            <input
                type="time"
                class="edit-start"
                value="${record.startTime}"
            >

            <label>
                帰庫時刻
            </label>

            <input
                type="time"
                class="edit-end"
                value="${record.endTime}"
            >

            <div class="edit-time-result">

                <span>
                    拘束時間
                </span>

                <strong
                    class="edit-calculated"
                >
                    ${formatMinutes(
                        record.minutes
                    )}
                </strong>

            </div>

            <div class="edit-actions">

                <button
                    class="edit-save-button"
                >
                    修正を保存
                </button>

                <button
                    class="edit-cancel-button"
                >
                    キャンセル
                </button>

            </div>
        `;


        const startInput =
            form.querySelector(
                ".edit-start"
            );


        const endInput =
            form.querySelector(
                ".edit-end"
            );


        const calculated =
            form.querySelector(
                ".edit-calculated"
            );


        function updateEditCalculation() {

            if (
                !startInput.value ||
                !endInput.value
            ) {

                calculated.textContent =
                    "--";

                return;
            }


            const minutes =
                calculateWorkMinutes(
                    startInput.value,
                    endInput.value
                );


            calculated.textContent =
                formatMinutes(
                    minutes
                );
        }


        startInput.addEventListener(
            "input",
            updateEditCalculation
        );


        endInput.addEventListener(
            "input",
            updateEditCalculation
        );


        form
            .querySelector(
                ".edit-save-button"
            )
            .addEventListener(
                "click",
                () => {

                    const newDate =
                        form.querySelector(
                            ".edit-date"
                        ).value;


                    const newStart =
                        startInput.value;


                    const newEnd =
                        endInput.value;


                    if (
                        !newDate ||
                        !newStart ||
                        !newEnd
                    ) {

                        alert(
                            "入力内容を確認してください。"
                        );

                        return;
                    }


                    const newMinutes =
                        calculateWorkMinutes(
                            newStart,
                            newEnd
                        );


                    updateRecord(
                        record,
                        {
                            date:
                                newDate,

                            inputType:
                                "time",

                            startTime:
                                newStart,

                            endTime:
                                newEnd,

                            minutes:
                                newMinutes
                        }
                    );
                }
            );
    }


    // ==========================
    // キャンセル
    // ==========================

    form
        .querySelector(
            ".edit-cancel-button"
        )
        .addEventListener(
            "click",
            () => {

                form.remove();
            }
        );


    row.appendChild(
        form
    );
}


// ==============================
// 記録修正
// ==============================

function updateRecord(
    targetRecord,
    newValues
) {

    const records =
        getAllRecords();


    let index =
        findRecordIndex(
            records,
            targetRecord
        );


    if (index === -1) {

        alert(
            "修正する勤務記録が見つかりません。"
        );

        return;
    }


    records[index] = {

        ...records[index],

        ...newValues

    };


    // 古いデータにIDがなければ
    // 修正時にIDを付与
    if (!records[index].id) {

        records[index].id =
            Date.now();
    }


    saveAllRecords(
        records
    );


    updateAllDisplays();


    alert(
        "勤務記録を修正しました。"
    );
}


// ==============================
// 削除
// ==============================

function deleteRecord(
    targetRecord
) {

    const records =
        getAllRecords();


    const index =
        findRecordIndex(
            records,
            targetRecord
        );


    if (index === -1) {

        return;
    }


    records.splice(
        index,
        1
    );


    saveAllRecords(
        records
    );


    updateAllDisplays();
}


// ==============================
// 記録検索
// ==============================

function findRecordIndex(
    records,
    targetRecord
) {

    // IDあり
    if (targetRecord.id) {

        const index =
            records.findIndex(
                record =>
                    record.id ===
                    targetRecord.id
            );


        if (index !== -1) {

            return index;
        }
    }


    // 古いテストデータ
    return records.findIndex(
        record =>

            record.date ===
                targetRecord.date &&

            record.minutes ===
                targetRecord.minutes
    );
}


// ==============================
// localStorage
// ==============================

function getAllRecords() {

    return (
        JSON.parse(
            localStorage.getItem(
                "workRecords"
            )
        ) || []
    );
}


function saveAllRecords(
    records
) {

    localStorage.setItem(
        "workRecords",
        JSON.stringify(records)
    );
}


// ==============================
// 合計
// ==============================

function getTotalMinutes(
    records
) {

    return records.reduce(
        (sum, record) =>
            sum + record.minutes,
        0
    );
}


// ==============================
// 表示変換
// ==============================

function formatMinutes(
    minutes
) {

    const rounded =
        Math.round(minutes);


    const negative =
        rounded < 0;


    const absolute =
        Math.abs(rounded);


    const hours =
        Math.floor(
            absolute / 60
        );


    const mins =
        absolute % 60;


    const text =
        `${hours}時間${String(
            mins
        ).padStart(
            2,
            "0"
        )}分`;


    return negative
        ? `-${text}`
        : text;
}


function formatSignedDifference(
    minutes
) {

    if (minutes >= 0) {

        return (
            `残り ${formatMinutes(
                minutes
            )}`
        );
    }


    return (
        `超過 ${formatMinutes(
            Math.abs(
                minutes
            )
        )}`
    );
}


function formatClockTime(
    minutes
) {

    let value =
        Math.round(
            minutes
        );


    value =
        (
            (
                value %
                (24 * 60)
            ) +
            (24 * 60)
        ) %
        (24 * 60);


    const hour =
        Math.floor(
            value / 60
        );


    const minute =
        value % 60;


    return (
        `${String(hour).padStart(
            2,
            "0"
        )}:` +
        `${String(minute).padStart(
            2,
            "0"
        )}`
    );
}


// ==============================
// 期間表示
// ==============================

function formatPeriod(
    period
) {

    return (
        formatDate(
            period.startDate
        ) +
        " ～ " +
        formatDate(
            period.endDate
        )
    );
}


function formatDate(
    date
) {

    return (
        `${date.getFullYear()}年` +
        `${date.getMonth() + 1}月` +
        `${date.getDate()}日`
    );
}


// ==============================
// 起動
// ==============================

updateAllDisplays();
