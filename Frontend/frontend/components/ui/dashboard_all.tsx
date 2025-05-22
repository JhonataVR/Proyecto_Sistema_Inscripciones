import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { API_BASE_URL } from "@/lib/api";
type DataItem = { value: number; groupId: string };

function getThemeColors(isDark: boolean) {
  return {
    background: isDark ? "transparent" : "transparent",
    axisLabel: isDark ? "#fff" : "#334155",
    bar: isDark ? "#00b9cc" : "#3b82f6",
    backText: isDark ? "#ffffff" : "#3b82f6",
  };
}

function useCountUp(target: number, duration = 800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }
    let start = 0;
    const stepTime = Math.max(duration / target, 16); // al menos 16ms por paso
    const interval = setInterval(() => {
      start += 1;
      if (start >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(start);
      }
    }, stepTime);
    return () => clearInterval(interval);
  }, [target, duration]);
  return count;
}

// Utilidad para detectar si es móvil
function isMobile() {
  if (typeof window !== "undefined") {
    return window.innerWidth < 640;
  }
  return false;
}

export default function DashboardAll() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.EChartsType | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [isSubdivided, setIsSubdivided] = useState(false);

  // Estado para los datos reales
  const [totalEstudiantes, setTotalEstudiantes] = useState(0);
  const [totalDocentes, setTotalDocentes] = useState(0);
  const [estudiantesPorMateria, setEstudiantesPorMateria] = useState<
    { nombre: string; total: number }[]
  >([]);
  const [docentesPorMateria, setDocentesPorMateria] = useState<
    { nombre: string; total: number }[]
  >([]);

  // Fetch de datos reales
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/dashboard/`)
      .then((res) => res.json())
      .then((data) => {
        setTotalEstudiantes(data.total_estudiantes);
        setTotalDocentes(data.total_docentes);
        setEstudiantesPorMateria(data.estudiantes_por_materia);
        setDocentesPorMateria(data.docentes_por_materia);
      });
  }, []);

  // Detecta modo oscuro
  useEffect(() => {
    const getIsDark = () => document.documentElement.classList.contains("dark");
    setIsDark(getIsDark());

    const observer = new MutationObserver(() => {
      setIsDark(getIsDark());
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      if (chartRef.current) {
        chartInstance.current = echarts.init(
          chartRef.current,
          getIsDark() ? "dark" : undefined
        );
        chartInstance.current.setOption(getOption(getIsDark()), {
          notMerge: true,
        });
        chartInstance.current.on("click", handleChartClick(getIsDark()));
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Inicializa el gráfico la primera vez
    if (chartRef.current) {
      chartInstance.current = echarts.init(
        chartRef.current,
        getIsDark() ? "dark" : undefined
      );
      chartInstance.current.setOption(getOption(getIsDark()), {
        notMerge: true,
      });
      chartInstance.current.on("click", handleChartClick(getIsDark()));
    }

    return () => {
      observer.disconnect();
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
    // eslint-disable-next-line
  }, [
    totalEstudiantes,
    totalDocentes,
    estudiantesPorMateria,
    docentesPorMateria,
  ]);

  // Opción principal del gráfico
  const getOption = (isDark: boolean): echarts.EChartsOption => {
    const colors = getThemeColors(isDark);
    const rotate = isMobile() ? 54 : 0; // 54 grados en móvil, horizontal en desktop
    return {
      backgroundColor: colors.background,
      xAxis: {
        data: ["Estudiantes", "Docentes"],
        axisLabel: { color: colors.axisLabel, rotate },
      },
      yAxis: {
        axisLabel: { color: colors.axisLabel },
      },
      series: {
        type: "bar",
        id: "main",
        itemStyle: { color: colors.bar },
        data: [
          { value: totalEstudiantes, groupId: "estudiantes" },
          { value: totalDocentes, groupId: "docentes" },
        ] as DataItem[],
        universalTransition: { enabled: true, divideShape: "clone" },
      },
    };
  };

  // Subdivisión al hacer click
  const handleChartClick = (isDark: boolean) => (event: any) => {
    const colors = getThemeColors(isDark);
    if (event.data && !isSubdivided) {
      if (event.data.groupId === "estudiantes") {
        setIsSubdivided(true);
        const materiasEstudiantes = Array.isArray(estudiantesPorMateria)
          ? estudiantesPorMateria.filter(
              (item) => typeof item.total === "number"
            )
          : [];
        chartInstance.current?.clear();
        chartInstance.current?.setOption(
          {
            backgroundColor: colors.background,
            xAxis: {
              data: materiasEstudiantes.map((item) => item.nombre),
              axisLabel: { color: colors.axisLabel, rotate: isMobile() ? 54 : 0 },
            },
            yAxis: {
              axisLabel: { color: colors.axisLabel },
            },
            series: {
              type: "bar",
              id: "sub",
              dataGroupId: "estudiantes",
              data: materiasEstudiantes.map((item) => item.total),
              itemStyle: { color: colors.bar },
              universalTransition: { enabled: true, divideShape: "clone" },
            },
            graphic: [
              {
                type: "text",
                left: 50,
                top: 20,
                style: {
                  text: "Atras",
                  fontSize: 18,
                  fill: colors.backText,
                  fontWeight: 600,
                },
                onclick: function () {
                  setIsSubdivided(false);
                  if (chartInstance.current) {
                    chartInstance.current.clear();
                    chartInstance.current.setOption(getOption(isDark), {
                      notMerge: true,
                    });
                  }
                },
              },
            ],
          },
          { notMerge: true }
        );
      } else if (event.data.groupId === "docentes") {
        setIsSubdivided(true);
        const materiasDocentes = Array.isArray(docentesPorMateria)
          ? docentesPorMateria.filter((item) => typeof item.total === "number")
          : [];
        chartInstance.current?.clear();
        chartInstance.current?.setOption(
          {
            backgroundColor: colors.background,
            xAxis: {
              data: materiasDocentes.map((item) => item.nombre),
              axisLabel: { color: colors.axisLabel, rotate: isMobile() ? 54 : 0 },
            },
            yAxis: {
              axisLabel: { color: colors.axisLabel },
            },
            series: {
              type: "bar",
              id: "sub",
              dataGroupId: "docentes",
              data: materiasDocentes.map((item) => item.total),
              itemStyle: { color: colors.bar },
              universalTransition: { enabled: true, divideShape: "clone" },
            },
            graphic: [
              {
                type: "text",
                left: 50,
                top: 20,
                style: {
                  text: "Atras",
                  fontSize: 20,
                  fill: colors.backText,
                  fontWeight: 600,
                },
                onclick: function () {
                  setIsSubdivided(false);
                  if (chartInstance.current) {
                    chartInstance.current.clear();
                    chartInstance.current.setOption(getOption(isDark), {
                      notMerge: true,
                    });
                  }
                },
              },
            ],
          },
          { notMerge: true }
        );
      }
    }
  };

  // Animaciones de conteo
  const animatedEstudiantes = useCountUp(totalEstudiantes);
  const animatedDocentes = useCountUp(totalDocentes);

  return (
    <div className="h-full">
      <div className="flex gap-8 mb-4 justify-center ">
        <div className="dark:bg-blue-100 dark:text-zinc-900 bg-zinc-900 text-blue-50 rounded px-4 py-2 font-semibold">
          Estudiantes: {animatedEstudiantes}
        </div>
        <div className="dark:bg-blue-100 dark:text-zinc-900 bg-zinc-900 text-blue-50 rounded px-4 py-2 font-semibold">
          Docentes: {animatedDocentes}
        </div>
      </div>
      <div  ref={chartRef} id="main" style={{ width: "100%", height: "75%" }} />
    </div>
  );
}
