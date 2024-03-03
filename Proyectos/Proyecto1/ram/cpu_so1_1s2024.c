// Módulo de CPU
// Este módulo deberá de estar alojado en un archivo ubicado en el directorio /proc.
// Características:
// ● Importar la librería <linux/sched.h>, <linux/sched/signal.h>
// ● La información que se mostrará en el módulo debe ser obtenida por medio de los struct de
// información del sistema operativo y no por otro medio.
// ● El nombre del módulo será: cpu_so1_1s2024

#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/sched.h>
#include <linux/sched/signal.h>

// Función que se ejecuta al cargar el módulo
int cpu_so1_1s2024_init(void) {
    struct task_struct *task;
    int contador = 0;
    for_each_process(task) {
        contador++;
    }
    printk(KERN_INFO "Número de procesos: %d\n", contador);
    return 0;
}

// Función que se ejecuta al descargar el módulo
void cpu_so1_1s2024_exit(void) {
    printk(KERN_INFO "Sistemas Operativos 1\n");
}

module_init(cpu_so1_1s2024_init);
module_exit(cpu_so1_1s2024_exit);

MODULE_LICENSE("GPL");
MODULE_DESCRIPTION("Módulo de CPU");
MODULE_AUTHOR("Daniel Cuque");