document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "workRecordsV2";
    const MONTHLY_LIMIT_MINUTES = 262 * 60;
    const FULL_FINAL_SHIFT_MINUTES = 19 * 60 + 40;
    const TWELVE_SHIFT_TARGET_MINUTES =
        MONTHLY_LIMIT_MINUTES - FULL_FINAL_SHIFT_MINUTES;
    const MAX_SHIFTS = 13;

    const workDateInput =
        document.getElementById("workDate");

    const workDateText =
        document.getElementById("workDateText");

    const revenueInput =
        document.getElementById("revenue");

    const directInput =
        document.getElementById("directInput");

    const timeInput =
        document.getElementById("timeInput");

    const startTimeInput =
        document.getElementById("startTime");

    const endTimeInput =
        document.getElementById("endTime");

    const saveButton =
        document.getElementById("saveButton");

    let selectedRevenueChartPeriod =
        "current";


    // ==============================
    // グラフ説明
    // ==============================

    const chartNote =
        document.querySelector(".chart-note");

    if (chartNote) {
        chartNote.textContent =
            "横軸は1〜13勤務目で固定表示します。記録済みの勤務には日付と曜日を表示します。";
    }


    // ==============================
    // モーダル
    // ==============================

    function openModal(id) {
        const modal =
            document.getElementById(id);

        if (!modal) {
            return;
        }

        updateAllDisplays();

        modal.classList.remove(
            "hidden"
        );

        if (
            id ===
            "revenueChartModal"
        ) {
            requestAnimationFrame(
                updateRevenueChart
            );
        }
    }


    function closeModal(id) {
        document
            .getElementById(id)
            ?.classList
            .add("hidden");
    }


    document
        .querySelectorAll(
            "[data-open]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    openModal(
                        button.dataset.open
                    );
                }
            );
        });


    document
        .querySelectorAll(
            "[data-close]"
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


    document
        .querySelectorAll(
            ".modal"
        )
        .forEach(modal => {
            modal.addEventListener(
                "click",
                event => {
                    if (
                        event.target ===
                        modal
                    ) {
                        modal.classList.add(
                            "hidden"
                        );
                    }
                }
            );
        });


    document
        .getElementById(
            "previousStatusButton"
        )
        ?.addEventListener(
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


    document
        .getElementById(
            "previousHistoryButton"
        )
        ?.addEventListener(
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
            "[data-chart-period]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    selectedRevenueChartPeriod =
                        button.dataset.chartPeriod;

                    updateRevenueChart();
                }
            );
        });


    window.addEventListener(
        "resize",
        () => {
            const modal =
                document.getElementById(
                    "revenueChartModal"
                );

            if (
                modal &&
                !modal.classList.contains(
                    "hidden"
                )
            ) {
                updateRevenueChart();
            }
        }
    );


    // ==============================
    // 勤務日
    // ==============================

    function updateWorkDateDisplay() {
        if (
            !workDateInput?.value
        ) {
            if (workDateText) {
                workDateText.textContent =
                    "日付を選択";
            }

            return;
        }

        const [
            year,
            month,
            day
        ] =
            workDateInput
                .value
                .split("-");

        if (workDateText) {
            workDateText.textContent =
                `${year}/${month}/${day}`;
        }
    }


    workDateInput
        ?.addEventListener(
            "change",
            updateWorkDateDisplay
        );


    // ==============================
    // 入力方法
    // ==============================

    function getInputType() {
        return (
            document.querySelector(
                'input[name="inputType"]:checked'
            )?.value ||
            "direct"
        );
    }


    function updateInputType() {
        const type =
            getInputType();

        directInput
            ?.classList
            .toggle(
                "hidden",
                type !== "direct"
            );

        timeInput
            ?.classList
            .toggle(
                "hidden",
                type === "direct"
            );

        if (
            type !== "direct"
        ) {
            calculateFromTimes();
        }
    }


    document
        .querySelectorAll(
            'input[name="inputType"]'
        )
        .forEach(radio => {
            radio.addEventListener(
                "change",
                updateInputType
            );
        });


    // ==============================
    // 出庫・帰庫時刻
    // ==============================

    function calculateWorkMinutes(
        startTime,
        endTime
    ) {
        const [
            startHour,
            startMinute
        ] =
            startTime
                .split(":")
                .map(Number);

        const [
            endHour,
            endMinute
        ] =
            endTime
                .split(":")
                .map(Number);

        let start =
            startHour * 60 +
            startMinute;

        let end =
            endHour * 60 +
            endMinute;

        if (
            end <= start
        ) {
            end +=
                24 * 60;
        }

        return (
            end -
            start +
            40
        );
    }


    function calculateFromTimes() {
        const display =
            document.getElementById(
                "calculatedHours"
            );

        const startTime =
            startTimeInput?.value;

        const endTime =
            endTimeInput?.value;

        if (
            !startTime ||
            !endTime
        ) {
            if (display) {
                display.textContent =
                    "--";
            }

            return null;
        }

        const minutes =
            calculateWorkMinutes(
                startTime,
                endTime
            );

        if (display) {
            display.textContent =
                formatMinutes(
                    minutes
                );
        }

        return minutes;
    }


    startTimeInput
        ?.addEventListener(
            "input",
            calculateFromTimes
        );


    endTimeInput
        ?.addEventListener(
            "input",
            calculateFromTimes
        );


    // ==============================
    // 保存
    // ==============================

    saveButton
        ?.addEventListener(
            "click",
            () => {
                const date =
                    workDateInput?.value ||
                    "";

                if (!date) {
                    alert(
                        "勤務日を入力してください。"
                    );

                    return;
                }

                const revenueValue =
                    revenueInput?.value ??
                    "";

                const revenue =
                    Number(
                        revenueValue
                    );

                if (
                    revenueValue === "" ||
                    !Number.isFinite(
                        revenue
                    ) ||
                    revenue < 0
                ) {
                    alert(
                        "営収を正しく入力してください。"
                    );

                    return;
                }

                let minutes;

                if (
                    getInputType() ===
                    "direct"
                ) {
                    const hoursValue =
                        document
                            .getElementById(
                                "directHours"
                            )
                            ?.value ??
                        "";

                    const minsValue =
                        document
                            .getElementById(
                                "directMinutes"
                            )
                            ?.value ??
                        "";

                    const hours =
                        Number(
                            hoursValue
                        );

                    const mins =
                        Number(
                            minsValue
                        );

                    if (
                        hoursValue === "" ||
                        minsValue === "" ||
                        !Number.isFinite(
                            hours
                        ) ||
                        !Number.isFinite(
                            mins
                        ) ||
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

                    if (
                        minutes === null
                    ) {
                        alert(
                            "出庫時刻と帰庫時刻を入力してください。"
                        );

                        return;
                    }
                }

                let records =
                    getAllRecords();

                const existing =
                    records.find(
                        record =>
                            record.date ===
                            date
                    );

                if (existing) {
                    const replace =
                        confirm(
                            "この勤務日の記録がすでにあります。\n上書きしますか？"
                        );

                    if (!replace) {
                        return;
                    }

                    records =
                        records.filter(
                            record =>
                                record.date !==
                                date
                        );
                }

                records.push({
                    id:
                        Date.now(),

                    date,

                    revenue:
                        Math.round(
                            revenue
                        ),

                    minutes:
                        Math.round(
                            minutes
                        )
                });

                saveAllRecords(
                    records
                );

                clearInputs();

                updateAllDisplays();

                alert(
                    "勤務を保存しました。"
                );
            }
        );


    function clearInputs() {
        if (revenueInput) {
            revenueInput.value =
                "";
        }

        const directHours =
            document.getElementById(
                "directHours"
            );

        const directMinutes =
            document.getElementById(
                "directMinutes"
            );

        const calculatedHours =
            document.getElementById(
                "calculatedHours"
            );

        if (directHours) {
            directHours.value =
                "";
        }

        if (directMinutes) {
            directMinutes.value =
                "";
        }

        if (startTimeInput) {
            startTimeInput.value =
                "";
        }

        if (endTimeInput) {
            endTimeInput.value =
                "";
        }

        if (calculatedHours) {
            calculatedHours.textContent =
                "--";
        }
    }


    // ==============================
    // localStorage
    // ==============================

    function getAllRecords() {
        try {
            const raw =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!raw) {
                return [];
            }

            const records =
                JSON.parse(
                    raw
                );

            return Array.isArray(
                records
            )
                ? records
                : [];

        } catch (error) {
            console.error(
                error
            );

            return [];
        }
    }


    function saveAllRecords(
        records
    ) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                records
            )
        );
    }


    // ==============================
    // 締め期間
    // ==============================

    function getWorkPeriod(
        date
    ) {
        const year =
            date.getFullYear();

        const month =
            date.getMonth();

        const day =
            date.getDate();

        let startDate;
        let endDate;

        if (
            day >= 16
        ) {
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
            0,
            0,
            0,
            0
        );

        endDate.setHours(
            23,
            59,
            59,
            999
        );

        return {
            startDate,
            endDate
        };
    }


    function getPreviousPeriod(
        currentStart
    ) {
        const date =
            new Date(
                currentStart
            );

        date.setDate(
            date.getDate() -
            1
        );

        return getWorkPeriod(
            date
        );
    }


    function filterRecordsByPeriod(
        records,
        period
    ) {
        return records.filter(
            record => {
                const date =
                    new Date(
                        `${record.date}T00:00:00`
                    );

                return (
                    date >=
                    period.startDate &&
                    date <=
                    period.endDate
                );
            }
        );
    }


    // ==============================
    // 集計
    // ==============================

    function getTotalMinutes(
        records
    ) {
        return records.reduce(
            (
                total,
                record
            ) =>
                total +
                Number(
                    record.minutes ||
                    0
                ),
            0
        );
    }


    function getTotalRevenue(
        records
    ) {
        return records.reduce(
            (
                total,
                record
            ) =>
                total +
                Number(
                    record.revenue ||
                    0
                ),
            0
        );
    }


    function getAverageRevenue(
        records
    ) {
        if (
            records.length === 0
        ) {
            return 0;
        }

        return Math.round(
            getTotalRevenue(
                records
            ) /
            records.length
        );
    }


    // ==============================
    // 営収グラフ
    // ==============================

    function updateRevenueChart() {
        const canvas =
            document.getElementById(
                "revenueChartCanvas"
            );

        const scroll =
            document.getElementById(
                "revenueChartScroll"
            );

        const empty =
            document.getElementById(
                "revenueChartEmpty"
            );

        if (
            !canvas ||
            !scroll ||
            !empty
        ) {
            return;
        }

        const records =
            getAllRecords();

        const currentPeriod =
            getWorkPeriod(
                new Date()
            );

        const previousPeriod =
            getPreviousPeriod(
                currentPeriod.startDate
            );

        const period =
            selectedRevenueChartPeriod ===
            "previous"
                ? previousPeriod
                : currentPeriod;

        const periodRecords =
            filterRecordsByPeriod(
                records,
                period
            )
                .sort(
                    (a, b) =>
                        a.date.localeCompare(
                            b.date
                        )
                )
                .slice(
                    0,
                    MAX_SHIFTS
                );

        setText(
            "revenueChartPeriod",
            formatPeriod(
                period
            )
        );

        setText(
            "revenueChartCount",
            `${periodRecords.length}勤務`
        );

        setText(
            "revenueChartAverage",
            `平均 ${formatYen(
                getAverageRevenue(
                    periodRecords
                )
            )}`
        );

        document
            .querySelectorAll(
                "[data-chart-period]"
            )
            .forEach(button => {
                button.classList.toggle(
                    "active",
                    button.dataset.chartPeriod ===
                        selectedRevenueChartPeriod
                );
            });

        if (
            periodRecords.length ===
            0
        ) {
            empty.classList.remove(
                "hidden"
            );

            scroll.classList.add(
                "hidden"
            );

            clearRevenueChart(
                canvas
            );

            return;
        }

        empty.classList.add(
            "hidden"
        );

        scroll.classList.remove(
            "hidden"
        );

        drawRevenueLineChart(
            canvas,
            scroll,
            periodRecords
        );
    }


    function clearRevenueChart(
        canvas
    ) {
        const context =
            canvas.getContext(
                "2d"
            );

        if (!context) {
            return;
        }

        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );
    }


    function drawRevenueLineChart(
        canvas,
        container,
        records
    ) {
        const context =
            canvas.getContext(
                "2d"
            );

        if (!context) {
            return;
        }

        const deviceScale =
            Math.min(
                window.devicePixelRatio ||
                    1,
                2
            );

        const cssWidth =
            Math.max(
                container.clientWidth -
                    2,
                280
            );

        const cssHeight =
            300;

        canvas.style.width =
            "100%";

        canvas.style.height =
            `${cssHeight}px`;

        canvas.width =
            Math.round(
                cssWidth *
                deviceScale
            );

        canvas.height =
            Math.round(
                cssHeight *
                deviceScale
            );

        context.setTransform(
            deviceScale,
            0,
            0,
            deviceScale,
            0,
            0
        );

        context.clearRect(
            0,
            0,
            cssWidth,
            cssHeight
        );

        const padding = {
            top: 38,
            right: 10,
            bottom: 62,
            left: 44
        };

        const plotWidth =
            cssWidth -
            padding.left -
            padding.right;

        const plotHeight =
            cssHeight -
            padding.top -
            padding.bottom;

        const values =
            records.map(
                record =>
                    Math.max(
                        0,
                        Number(
                            record.revenue
                        ) ||
                            0
                    )
            );

        const highestRevenue =
            Math.max(
                ...values,
                0
            );

        const yStep =
            10000;

        const yMax =
            Math.max(
                yStep,
                Math.ceil(
                    highestRevenue /
                        yStep
                ) *
                    yStep
            );

        const yTicks =
            4;

        context.font =
            '11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

        context.textBaseline =
            "middle";


        // ==============================
        // 横線
        // ==============================

        for (
            let index = 0;
            index <= yTicks;
            index += 1
        ) {
            const ratio =
                index /
                yTicks;

            const y =
                padding.top +
                plotHeight -
                plotHeight *
                    ratio;

            const value =
                Math.round(
                    yMax *
                    ratio
                );

            context.beginPath();

            context.strokeStyle =
                "#e2e7e4";

            context.lineWidth =
                1;

            context.moveTo(
                padding.left,
                y
            );

            context.lineTo(
                cssWidth -
                    padding.right,
                y
            );

            context.stroke();

            context.fillStyle =
                "#6d746f";

            context.textAlign =
                "right";

            context.fillText(
                formatRevenueAxis(
                    value
                ),
                padding.left -
                    6,
                y
            );
        }


        const getX =
            index =>
                padding.left +
                (
                    plotWidth *
                    index
                ) /
                    (
                        MAX_SHIFTS -
                        1
                    );


        const getY =
            value =>
                padding.top +
                plotHeight -
                (
                    plotHeight *
                    value
                ) /
                    yMax;


        // ==============================
        // 1〜13勤務固定ガイド
        // ==============================

        for (
            let index = 0;
            index < MAX_SHIFTS;
            index += 1
        ) {
            const x =
                getX(
                    index
                );

            context.beginPath();

            context.strokeStyle =
                "#edf0ee";

            context.lineWidth =
                1;

            context.moveTo(
                x,
                padding.top
            );

            context.lineTo(
                x,
                padding.top +
                    plotHeight
            );

            context.stroke();
        }


        // ==============================
        // 営収折れ線
        // ==============================

        context.beginPath();

        context.strokeStyle =
            "#16864b";

        context.lineWidth =
            3;

        context.lineJoin =
            "round";

        context.lineCap =
            "round";


        records.forEach(
            (
                record,
                index
            ) => {
                const x =
                    getX(
                        index
                    );

                const y =
                    getY(
                        values[index]
                    );

                if (
                    index === 0
                ) {
                    context.moveTo(
                        x,
                        y
                    );

                } else {
                    context.lineTo(
                        x,
                        y
                    );
                }
            }
        );


        context.stroke();


        // ==============================
        // 点・日付・未勤務枠
        // ==============================

        for (
            let index = 0;
            index < MAX_SHIFTS;
            index += 1
        ) {
            const x =
                getX(
                    index
                );

            const record =
                records[index];

            if (record) {
                const y =
                    getY(
                        values[index]
                    );

                context.beginPath();

                context.fillStyle =
                    "#16864b";

                context.arc(
                    x,
                    y,
                    4,
                    0,
                    Math.PI *
                        2
                );

                context.fill();


                context.fillStyle =
                    "#202422";

                context.textAlign =
                    "center";

                context.textBaseline =
                    "bottom";

                context.font =
                    '700 9px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

                context.fillText(
                    formatRevenuePoint(
                        values[index]
                    ),
                    x,
                    Math.max(
                        12,
                        y -
                            8
                    )
                );


                const dateParts =
                    formatChartDateParts(
                        record.date
                    );

                context.fillStyle =
                    "#4f5752";

                context.textBaseline =
                    "top";

                context.font =
                    '8px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

                context.fillText(
                    dateParts.date,
                    x,
                    padding.top +
                        plotHeight +
                        10
                );


                context.fillStyle =
                    "#7a817d";

                context.fillText(
                    dateParts.weekday,
                    x,
                    padding.top +
                        plotHeight +
                        22
                );

            } else {
                context.fillStyle =
                    "#b4bbb7";

                context.textAlign =
                    "center";

                context.textBaseline =
                    "top";

                context.font =
                    '8px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

                context.fillText(
                    `${index + 1}`,
                    x,
                    padding.top +
                        plotHeight +
                        14
                );
            }
        }
    }


    function formatRevenueAxis(
        value
    ) {
        if (
            value >= 10000
        ) {
            const units =
                value /
                10000;

            return Number.isInteger(
                units
            )
                ? `${units}万`
                : `${units.toFixed(
                      1
                  )}万`;
        }

        return value.toLocaleString(
            "ja-JP"
        );
    }


    function formatRevenuePoint(
        value
    ) {
        if (
            value >= 10000
        ) {
            return `${(
                value /
                10000
            ).toFixed(1)}万`;
        }

        return value.toLocaleString(
            "ja-JP"
        );
    }


    function formatChartDateParts(
        dateText
    ) {
        const date =
            new Date(
                `${dateText}T00:00:00`
            );

        const weekdays = [
            "日",
            "月",
            "火",
            "水",
            "木",
            "金",
            "土"
        ];

        return {
            date:
                `${date.getMonth() + 1}/` +
                `${date.getDate()}`,

            weekday:
                `(${weekdays[
                    date.getDay()
                ]})`
        };
    }


    // ==============================
    // 全表示更新
    // ==============================

    function updateAllDisplays() {
        const records =
            getAllRecords();

        const currentPeriod =
            getWorkPeriod(
                new Date()
            );

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


        setText(
            "currentPeriod",
            formatPeriod(
                currentPeriod
            )
        );

        setText(
            "historyPeriod",
            formatPeriod(
                currentPeriod
            )
        );

        setText(
            "workCount",
            `${currentRecords.length} / 13`
        );

        setText(
            "totalRevenue",
            formatYen(
                getTotalRevenue(
                    currentRecords
                )
            )
        );

        setText(
            "averageRevenue",
            formatYen(
                getAverageRevenue(
                    currentRecords
                )
            )
        );


        const currentMinutes =
            getTotalMinutes(
                currentRecords
            );

        setText(
            "totalHours",
            formatMinutes(
                currentMinutes
            )
        );

        setText(
            "remainingHours",
            formatMinutes(
                MONTHLY_LIMIT_MINUTES -
                    currentMinutes
            )
        );


        setText(
            "previousPeriod",
            formatPeriod(
                previousPeriod
            )
        );

        setText(
            "previousHistoryPeriod",
            formatPeriod(
                previousPeriod
            )
        );

        setText(
            "previousWorkCount",
            `${previousRecords.length} / 13`
        );

        setText(
            "previousTotalRevenue",
            formatYen(
                getTotalRevenue(
                    previousRecords
                )
            )
        );

        setText(
            "previousAverageRevenue",
            formatYen(
                getAverageRevenue(
                    previousRecords
                )
            )
        );

        setText(
            "previousTotalHours",
            formatMinutes(
                getTotalMinutes(
                    previousRecords
                )
            )
        );


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


        const revenueChartModal =
            document.getElementById(
                "revenueChartModal"
            );

        if (
            revenueChartModal &&
            !revenueChartModal.classList.contains(
                "hidden"
            )
        ) {
            updateRevenueChart();
        }
    }


    function setText(
        id,
        value
    ) {
        const element =
            document.getElementById(
                id
            );

        if (element) {
            element.textContent =
                value;
        }
    }


    // ==============================
    // 勤務履歴
    // ==============================

    function updateHistory(
        records,
        elementId
    ) {
        const element =
            document.getElementById(
                elementId
            );

        if (!element) {
            return;
        }

        element.innerHTML =
            "";

        if (
            records.length === 0
        ) {
            element.textContent =
                "勤務記録はありません。";

            return;
        }

        [...records]
            .sort(
                (a, b) =>
                    a.date.localeCompare(
                        b.date
                    )
            )
            .forEach(record => {
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
                        `${record.date}T00:00:00`
                    );

                const dateText =
                    formatHistoryDate(
                        date
                    );


                info.innerHTML = `
                    <div class="history-date">
                        ${dateText}
                    </div>

                    <div class="history-detail">

                        <span>
                            営収
                        </span>

                        <strong class="history-revenue">
                            ${formatYen(
                                record.revenue
                            )}
                        </strong>

                        <span>
                            拘束時間
                        </span>

                        <strong>
                            ${formatMinutes(
                                record.minutes
                            )}
                        </strong>

                    </div>
                `;


                const actions =
                    document.createElement(
                        "div"
                    );

                actions.className =
                    "history-actions";


                const editButton =
                    document.createElement(
                        "button"
                    );

                editButton.className =
                    "edit-button";

                editButton.textContent =
                    "修正";

                editButton.addEventListener(
                    "click",
                    () => {
                        showEditForm(
                            row,
                            record
                        );
                    }
                );


                const deleteButton =
                    document.createElement(
                        "button"
                    );

                deleteButton.className =
                    "delete-button";

                deleteButton.textContent =
                    "削除";

                deleteButton.addEventListener(
                    "click",
                    () => {
                        if (
                            !confirm(
                                `${dateText}の勤務記録を削除しますか？`
                            )
                        ) {
                            return;
                        }

                        deleteRecord(
                            record.id
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
    // 修正
    // ==============================

    function showEditForm(
        row,
        record
    ) {
        if (
            row.querySelector(
                ".edit-form"
            )
        ) {
            return;
        }

        const hours =
            Math.floor(
                Number(
                    record.minutes
                ) /
                    60
            );

        const minutes =
            Number(
                record.minutes
            ) %
            60;


        const form =
            document.createElement(
                "div"
            );

        form.className =
            "edit-form";


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
                営収
            </label>

            <input
                type="number"
                class="edit-revenue"
                min="0"
                inputmode="numeric"
                value="${record.revenue}"
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

                <span>
                    時間
                </span>

                <input
                    type="number"
                    class="edit-minutes"
                    min="0"
                    max="59"
                    inputmode="numeric"
                    value="${minutes}"
                >

                <span>
                    分
                </span>

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
                ".edit-cancel-button"
            )
            ?.addEventListener(
                "click",
                () => {
                    form.remove();
                }
            );


        form
            .querySelector(
                ".edit-save-button"
            )
            ?.addEventListener(
                "click",
                () => {
                    const date =
                        form
                            .querySelector(
                                ".edit-date"
                            )
                            ?.value ||
                        "";

                    const revenueValue =
                        form
                            .querySelector(
                                ".edit-revenue"
                            )
                            ?.value ??
                        "";

                    const hoursValue =
                        form
                            .querySelector(
                                ".edit-hours"
                            )
                            ?.value ??
                        "";

                    const minutesValue =
                        form
                            .querySelector(
                                ".edit-minutes"
                            )
                            ?.value ??
                        "";

                    const revenue =
                        Number(
                            revenueValue
                        );

                    const newHours =
                        Number(
                            hoursValue
                        );

                    const newMinutes =
                        Number(
                            minutesValue
                        );


                    if (
                        !date ||
                        revenueValue === "" ||
                        hoursValue === "" ||
                        minutesValue === "" ||
                        !Number.isFinite(
                            revenue
                        ) ||
                        !Number.isFinite(
                            newHours
                        ) ||
                        !Number.isFinite(
                            newMinutes
                        ) ||
                        revenue < 0 ||
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


                    updateRecord(
                        record.id,
                        {
                            date,

                            revenue:
                                Math.round(
                                    revenue
                                ),

                            minutes:
                                newHours *
                                    60 +
                                newMinutes
                        }
                    );
                }
            );


        row.appendChild(
            form
        );
    }


    function updateRecord(
        id,
        values
    ) {
        const records =
            getAllRecords();

        const index =
            records.findIndex(
                record =>
                    record.id ===
                    id
            );


        if (
            index === -1
        ) {
            alert(
                "勤務記録が見つかりません。"
            );

            return;
        }


        const duplicate =
            records.some(
                record =>
                    record.id !==
                        id &&
                    record.date ===
                        values.date
            );


        if (duplicate) {
            alert(
                "同じ勤務日の記録がすでにあります。"
            );

            return;
        }


        records[index] = {
            ...records[index],
            ...values
        };


        saveAllRecords(
            records
        );

        updateAllDisplays();

        alert(
            "勤務記録を修正しました。"
        );
    }


    function deleteRecord(
        id
    ) {
        const records =
            getAllRecords()
                .filter(
                    record =>
                        record.id !==
                        id
                );

        saveAllRecords(
            records
        );

        updateAllDisplays();
    }


    // ==============================
    // 13勤務目予測
    // ==============================

    function updateForecast(
        records
    ) {
        const forecast =
            document.getElementById(
                "forecast"
            );

        if (!forecast) {
            return;
        }


        const count =
            records.length;

        const totalMinutes =
            getTotalMinutes(
                records
            );


        if (
            count === 0
        ) {
            forecast.textContent =
                "まだ勤務記録がありません。";

            return;
        }


        if (
            count >= 13
        ) {
            const remaining =
                MONTHLY_LIMIT_MINUTES -
                totalMinutes;

            forecast.innerHTML = `
                <div class="forecast-box">

                    <div class="forecast-main">
                        13勤務を記録済みです
                    </div>

                    <div class="forecast-line">

                        <span>
                            累計拘束時間
                        </span>

                        <strong>
                            ${formatMinutes(
                                totalMinutes
                            )}
                        </strong>

                    </div>

                    <div class="forecast-line">

                        <span>
                            262時間との差
                        </span>

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
            12 -
            count;

        let allowedAverage =
            null;


        if (
            shiftsBeforeFinal >
            0
        ) {
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


        const selectedShift =
            document.querySelector(
                'input[name="finalShiftType"]:checked'
            );


        const shiftType =
            selectedShift
                ? Number(
                      selectedShift.value
                  )
                : 15;


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
            projectedFinalAvailable >
            0
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


        if (
            shiftsBeforeFinal >
            0
        ) {
            if (
                allowedAverage >=
                0
            ) {
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
            const available =
                MONTHLY_LIMIT_MINUTES -
                totalMinutes;

            adjustmentHtml = `
                <div class="forecast-line">

                    <span>
                        13勤務目に使える拘束時間
                    </span>

                    <strong>
                        ${formatMinutes(
                            available
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


    document
        .querySelectorAll(
            'input[name="finalShiftType"]'
        )
        .forEach(radio => {
            radio.addEventListener(
                "change",
                updateAllDisplays
            );
        });


    // ==============================
    // 表示変換
    // ==============================

    function formatMinutes(
        minutes
    ) {
        const rounded =
            Math.round(
                Number(
                    minutes
                )
            );

        const negative =
            rounded < 0;

        const absolute =
            Math.abs(
                rounded
            );

        const hours =
            Math.floor(
                absolute /
                60
            );

        const mins =
            absolute %
            60;

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


    function formatYen(
        value
    ) {
        return (
            `¥${Math.round(
                Number(
                    value
                ) ||
                    0
            ).toLocaleString(
                "ja-JP"
            )}`
        );
    }


    function formatSignedDifference(
        minutes
    ) {
        if (
            minutes >= 0
        ) {
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
                    1440
                ) +
                1440
            ) %
            1440;

        const hour =
            Math.floor(
                value /
                60
            );

        const minute =
            value %
            60;

        return (
            `${String(
                hour
            ).padStart(
                2,
                "0"
            )}:` +
            `${String(
                minute
            ).padStart(
                2,
                "0"
            )}`
        );
    }


    function formatPeriod(
        period
    ) {
        return (
            `${formatDate(
                period.startDate
            )} ～ ` +
            `${formatDate(
                period.endDate
            )}`
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


    function formatHistoryDate(
        date
    ) {
        const weekdays = [
            "日",
            "月",
            "火",
            "水",
            "木",
            "金",
            "土"
        ];

        return (
            `${date.getMonth() + 1}/` +
            `${date.getDate()}` +
            `（${weekdays[
                date.getDay()
            ]}）`
        );
    }


    // ==============================
    // 起動
    // ==============================

    updateWorkDateDisplay();

    updateInputType();

    updateAllDisplays();
});
