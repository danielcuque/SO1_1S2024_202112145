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
    struct list_head children;
};

static struct process_info root;

static void agregar_hijos(struct task_struct *parent, struct process_info *node) {
    struct task_struct *child;
    struct process_info *child_node;

    list_for_each_entry(child, &parent->children, sibling) {
        child_node = kmalloc(sizeof(struct process_info), GFP_KERNEL); // Allocate memory for child_node
        if (!child_node) {
            printk(KERN_ERR "Error al asignar memoria para child_node\n");
            return;
        }
        INIT_LIST_HEAD(&child_node->children); // Initialize the children list for child_node
        child_node->pid = child->pid;
        strncpy(child_node->name, child->comm, TASK_COMM_LEN - 1);
        child_node->rss = (child->mm) ? (get_mm_rss(child->mm) << PAGE_SHIFT) : 0;
        child_node->uid = from_kuid(&init_user_ns, child->cred->user->uid);
        list_add_tail(&child_node->children, &node->children); // Add child_node to the children list of node
        agregar_hijos(child, child_node); // Recursively add children of child
    }
}

static void inicializar_arbol(void) {
    INIT_LIST_HEAD(&root.children); // Initialize the children list of root
    root.pid = 0;
    strncpy(root.name, "root", TASK_COMM_LEN - 1);
    root.rss = 0;
    root.uid = 0;
    agregar_hijos(&init_task, &root);
}

static void imprimir_procesos(struct seq_file *archivo, struct process_info *node, int nivel) {
    // Print process information
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

    if (!list_empty(&node->children)) {
        seq_printf(archivo, "\"children\": [\n");
        struct process_info *child_node;
        list_for_each_entry(child_node, &node->children, children) {
            imprimir_procesos(archivo, child_node, nivel + 1);
            if (list_is_last(&child_node->children, &node->children)) {
                seq_printf(archivo, "\n");
            } else {
                seq_printf(archivo, ",\n");
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

static int mostrar_informacion_cpu(struct seq_file *archivo, void *v) {
    inicializar_arbol(); // Initialize the tree structure
    imprimir_procesos(archivo, &root, 0); // Print process information recursively
    return 0;
}

static int abrir_archivo(struct inode *inode, struct file *file)
{
    return single_open(file, mostrar_informacion_cpu, NULL);
}

static const struct file_operations operaciones = {
    .owner = THIS_MODULE,
    .open = abrir_archivo,
    .read = seq_read,
    .llseek = seq_lseek,
    .release = single_release,
};

static int __init cargar_modulo(void)
{
    proc_create("cpu_so1_1s2024", 0, NULL, &operaciones);
    printk(KERN_INFO "Módulo CPU cargado exitosamente\n");
    return 0;
}

static void __exit descargar_modulo(void)
{
    remove_proc_entry("cpu_so1_1s2024", NULL);
    printk(KERN_INFO "Módulo CPU descargado exitosamente\n");
}

module_init(cargar_modulo);
module_exit(descargar_modulo);
