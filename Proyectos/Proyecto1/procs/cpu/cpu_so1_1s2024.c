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

MODULE_LICENSE("GPL");
MODULE_DESCRIPTION("Módulo CPU - Laboratorio Sistemas Operativos 1");
MODULE_AUTHOR("Daniel Estuardo Cuque Ruíz");

struct process_info {
    int pid;
    char name[TASK_COMM_LEN];
    unsigned long rss;
    int uid;
    struct process_info *children;
    int num_children;
};

static struct process_info root;

// Esta función recorre recursivamente la lista de procesos hijos y los agrega a la estructura de árbol
static void agregar_hijos(struct task_struct *parent, struct process_info *node) {
    struct task_struct *child;
    struct process_info *child_node;
    int i = 0;

    list_for_each_entry(child, &parent->children, sibling) {
        child_node = &node->children[i++];
        child_node->pid = child->pid;
        strncpy(child_node->name, child->comm, TASK_COMM_LEN - 1);
        child_node->rss = (child->mm) ? (get_mm_rss(child->mm) << PAGE_SHIFT) : 0;
        child_node->uid = from_kuid(&init_user_ns, child->cred->user->uid);
        child_node->children = NULL;
        child_node->num_children = 0;
        agregar_hijos(child, child_node); // Llamada recursiva para agregar los hijos de este proceso
        node->num_children++;
    }
}

// Esta función inicializa la estructura de árbol con el proceso raíz y llama a agregar_hijos para poblarla
static void inicializar_arbol(void) {
    INIT_LIST_HEAD(&root.children);
    root.pid = 0; // PID 0 es el proceso init o systemd en sistemas modernos
    strncpy(root.name, "root", TASK_COMM_LEN - 1);
    root.rss = 0;
    root.uid = 0;
    root.children = NULL;
    root.num_children = 0;
    agregar_hijos(&init_task, &root);
}

static int mostrar_informacion_cpu(struct seq_file *archivo, void *v) {
    // Inicializar la estructura de árbol
    inicializar_arbol();

    // Imprimir la información de los procesos recursivamente
    imprimir_procesos(archivo, &root, 0);

    return 0;
}

static void imprimir_procesos(struct seq_file *archivo, struct process_info *node, int nivel) {
    int i;
    for (i = 0; i < nivel; i++) {
        seq_printf(archivo, "    ");
    }

    seq_printf(archivo, "{\n");
    for (i = 0; i < nivel + 1; i++) {
        seq_printf(archivo, "    ");
    }
    seq_printf(archivo, "\"processId\": %d,\n", node->pid);
    for (i = 0; i < nivel + 1; i++) {
        seq_printf(archivo, "    ");
    }
    seq_printf(archivo, "\"PID\": %d,\n", node->pid);
    for (i = 0; i < nivel + 1; i++) {
        seq_printf(archivo, "    ");
    }
    seq_printf(archivo, "\"Name\": \"%s\",\n", node->name);
    for (i = 0; i < nivel + 1; i++) {
        seq_printf(archivo, "    ");
    }
    seq_printf(archivo, "\"RSS\": %lu,\n", node->rss);
    for (i = 0; i < nivel + 1; i++) {
        seq_printf(archivo, "    ");
    }
    seq_printf(archivo, "\"UID\": %d,\n", node->uid);
    for (i = 0; i < nivel + 1; i++) {
        seq_printf(archivo, "    ");
    }

    if (node->num_children > 0) {
        seq_printf(archivo, "\"children\": [\n");
        for (i = 0; i < node->num_children; i++) {
            imprimir_procesos(archivo, &node->children[i], nivel + 1);
            if (i < node->num_children - 1) {
                seq_printf(archivo, ",\n");
            } else {
                seq_printf(archivo, "\n");
            }
        }
        for (i = 0; i < nivel + 1; i++) {
            seq_printf(archivo, "    ");
        }
        seq_printf(archivo, "]");
    } else {
        seq_printf(archivo, "\"children\": []");
    }

    seq_printf(archivo, "\n");
    for (i = 0; i < nivel; i++) {
        seq_printf(archivo, "    ");
    }
    seq_printf(archivo, "}");

    return;
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
