// Info de los módulos
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/sched.h>
#include <linux/timekeeping.h>
#include <linux/timer.h>
#include <linux/jiffies.h>
#include <linux/proc_fs.h>
#include <linux/seq_file.h>
#include <asm/uaccess.h>
#include <linux/mm.h>
#include <linux/sched/cputime.h>
#include <linux/timekeeping.h>
#include <linux/time.h>

struct task_struct *cpu; // Estructura que almacena info del cpu
unsigned long rss;



MODULE_LICENSE("GPL");
MODULE_DESCRIPTION("Módulo CPU - Laboratorio Sistemas Operativos 1");
MODULE_AUTHOR("Daniel Estuardo Cuque Ruíz");

static void imprimir_hijos(struct seq_file *archivo, struct list_head *hijos);


static int mostrar_informacion_cpu(struct seq_file *archivo, void *v) {
    uint64_t total_cpu_time_ns;
    uint64_t total_usage_ns;
    unsigned long cpu_porcentaje;

    total_cpu_time_ns = 0; // Inicializa a cero
    total_usage_ns = 0;    // Inicializa a cero
    cpu_porcentaje=0;

    for_each_process(cpu) {
    uint64_t cpu_time_ns;
    cpu_time_ns = cpu->utime + cpu->stime;
    total_usage_ns += cpu_time_ns;
    }

    total_cpu_time_ns = ktime_to_ns(ktime_get());  // Obtén el tiempo total de CPU

    if (total_cpu_time_ns > 0) {
        cpu_porcentaje = (total_usage_ns * 100) / total_cpu_time_ns;
    } else {
        cpu_porcentaje = 0;  // Evitar división por cero
    }

    seq_printf(archivo, "{\n");
    
    seq_printf(archivo, "  \"porcentaje_utilizacion_cpu\": %ld,\n", cpu_porcentaje);
    seq_printf(archivo, "  \"procesos\": [\n");

    int first_process = 1;

    for_each_process(cpu) {
        if (!first_process) {
            seq_printf(archivo, ",\n");
        }
        first_process = 0;

        seq_printf(archivo, "    {\n");
        seq_printf(archivo, "      \"ID_PROCESO\": %d,\n", cpu->pid);
        seq_printf(archivo, "      \"PID\": %d,\n", cpu->pid);
        seq_printf(archivo, "      \"Nombre\": \"%s\",\n", cpu->comm);
        seq_printf(archivo, "      \"Estado\": %u,\n", cpu->__state);

        if (cpu->mm) {
            rss = get_mm_rss(cpu->mm) << PAGE_SHIFT;
            seq_printf(archivo, "      \"RSS\": %lu,\n", rss);
        } else {
            seq_printf(archivo, "      \"RSS\": null,\n");
        }

        seq_printf(archivo, "      \"UID\": %u,\n", from_kuid(&init_user_ns, cpu->cred->user->uid));

        // Verificar si el proceso tiene hijos
        if (!list_empty(&cpu->children)) {
            seq_printf(archivo, "      \"hijos\": [\n");
            imprimir_hijos(archivo, &cpu->children);
            seq_printf(archivo, "\n      ]");
        } else {
            seq_printf(archivo, "      \"hijos\": []");
        }

        seq_printf(archivo, "\n    }");
    }

    seq_printf(archivo, "\n  ]\n");
    seq_printf(archivo, "}\n");

    return 0;
}

static void imprimir_hijos(struct seq_file *archivo, struct list_head *hijos) {
    struct list_head *lstProcess;
    struct task_struct *child;
    int first_child = 1;

    list_for_each(lstProcess, hijos) {
        if (!first_child) {
            seq_printf(archivo, ",\n");
        }
        first_child = 0;

        child = list_entry(lstProcess, struct task_struct, sibling);

        seq_printf(archivo, "        {\n");
        seq_printf(archivo, "          \"ID_PROCESO_HIJO\": %d,\n", child->pid);
        seq_printf(archivo, "          \"PID_HIJO\": %d,\n", child->pid);
        seq_printf(archivo, "          \"Nombre_HIJO\": \"%s\",\n", child->comm);
        seq_printf(archivo, "          \"Estado_HIJO\": %u,\n", child->__state);

        if (child->mm) {
            rss = get_mm_rss(child->mm) << PAGE_SHIFT;
            seq_printf(archivo, "          \"RSS_HIJO\": %lu,\n", rss);
        } else {
            seq_printf(archivo, "          \"RSS_HIJO\": null,\n");
        }

        seq_printf(archivo, "          \"UID_HIJO\": %u\n", from_kuid(&init_user_ns, child->cred->user->uid));
        seq_printf(archivo, "        }");
    }
}


// Función que se ejecutará cada vez que se lea el archivo con el comando CAT
static int abrir_archivo(struct inode *inode, struct file *file)
{
    return single_open(file, mostrar_informacion_cpu, NULL);
}

// Si el kernel es 5.6 o mayor se usa la estructura proc_ops
static struct proc_ops operaciones =
{
    .proc_open = abrir_archivo,
    .proc_read = seq_read
};

// Función a ejecutar al insertar el módulo en el kernel con insmod
static int __init cargar_modulo(void)
{
    proc_create("cpu_so1_1s2024", 0, NULL, &operaciones);
    printk(KERN_INFO "Módulo CPU cargado exitosamente\n");
    return 0;
}

// Función a ejecutar al remover el módulo del kernel con rmmod
static void descargar_modulo(void)
{
    remove_proc_entry("cpu_so1_1s2024", NULL);
    printk(KERN_INFO "Módulo CPU descargado exitosamente\n");
}

module_init(cargar_modulo);
module_exit(descargar_modulo);
